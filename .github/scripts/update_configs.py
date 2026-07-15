#!/usr/bin/env python3
"""
Exit code 1 if ANY file was changed (used by the workflow to decide whether
to commit). Exit code 0 if nothing changed.
"""

from __future__ import annotations

import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote

REPO_ROOT = Path(__file__).resolve().parents[2]  # .github/scripts/ -> repo root
CONFIG_DIR_NAME = "[V3.x] Working Configs"
FORBIDDEN_LIST_PATH = REPO_ROOT / ".github" / "forbidden_cvars.txt"
TARGET_FILENAMES = {"engine.ini", "deviceprofiles.ini"}
GITHUB_REPO = "Arglax/Mobile-WuWa-Config"
GITHUB_BRANCH = "main"

END_MARKER_SNIPPET = "END OF MAIN NOTES"


# --------------------------------------------------------------------------
# Forbidden CVar handling
# --------------------------------------------------------------------------

def load_forbidden_cvars(path: Path) -> set[str]:
    cvars = set()
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        cvars.add(line.lower())
    return cvars


def extract_key_value(line: str) -> tuple[str, str] | None:
    """Return (key, value) for an active 'key=value' ini line, else None."""
    stripped = line.strip()
    if not stripped or stripped.startswith((";", "#", "[")):
        return None
    if "=" not in stripped:
        return None
    key, _, value = stripped.partition("=")
    key = key.strip()
    value = value.strip()
    if not key:
        return None
    return key, value


def strip_forbidden(lines: list[str], forbidden: set[str]) -> tuple[list[str], list[str]]:
    """Returns (kept_lines, removed_raw_lines)."""
    kept, removed = [], []
    for line in lines:
        parsed = extract_key_value(line)
        if parsed and parsed[0].lower() in forbidden:
            removed.append(line.rstrip("\n"))
            continue
        kept.append(line)
    return kept, removed


# --------------------------------------------------------------------------
# CVar-level diffing (for the auto changelog)
# --------------------------------------------------------------------------

def parse_cvars(lines: list[str]) -> dict[str, tuple[str, str]]:
    """key(lowercase) -> (original_key_text, value_text)"""
    result = {}
    for line in lines:
        parsed = extract_key_value(line)
        if parsed:
            key, value = parsed
            result[key.lower()] = (key, value)
    return result


def diff_cvars(old_lines: list[str], new_lines: list[str]) -> list[str]:
    """Return human-readable changelog bullet strings, or [] if no CVar changes."""
    old_map = parse_cvars(old_lines)
    new_map = parse_cvars(new_lines)

    messages = []

    for key in sorted(new_map.keys() - old_map.keys()):
        orig_key, value = new_map[key]
        messages.append(f"Added {orig_key} = {value}")

    for key in sorted(old_map.keys() - new_map.keys()):
        orig_key, value = old_map[key]
        messages.append(f"Removed {orig_key} (was {value})")

    for key in sorted(old_map.keys() & new_map.keys()):
        old_key, old_value = old_map[key]
        new_key, new_value = new_map[key]
        if old_value != new_value:
            messages.append(f"{new_key} changed from {old_value} to {new_value}")

    return messages


# --------------------------------------------------------------------------
# Header manipulation
# --------------------------------------------------------------------------

def split_header_body(lines: list[str]) -> tuple[list[str], list[str], int]:
    """Split into (header_lines, body_lines, header_end_index)."""
    for i, line in enumerate(lines):
        if END_MARKER_SNIPPET in line:
            return lines[: i + 1], lines[i + 1 :], i
    # No recognizable header — treat everything as body, empty header.
    return [], lines, -1


def build_github_link(repo_relative_path: str) -> str:
    encoded = quote(repo_relative_path, safe="/")
    return f"https://github.com/{GITHUB_REPO}/blob/{GITHUB_BRANCH}/{encoded}"


def update_link_line(header_lines: list[str], repo_relative_path: str) -> list[str]:
    new_url = build_github_link(repo_relative_path)
    updated = []
    found = False
    for line in header_lines:
        if line.strip().lower().startswith("; link:"):
            updated.append(f"; Link: {new_url}\n")
            found = True
        else:
            updated.append(line)
    if not found:
        # No Link line present — don't invent header structure we don't
        # recognize; leave header untouched in this case.
        return header_lines
    return updated


def insert_changelog_entry(header_lines: list[str], bullet_messages: list[str]) -> list[str]:
    if not bullet_messages:
        return header_lines

    changelog_idx = None
    changelog_pattern = re.compile(r"^;[\s]*changelog[\s]*:?[\s]*$", re.IGNORECASE)
    for i, line in enumerate(header_lines):
        if changelog_pattern.match(line.rstrip("\n")):
            changelog_idx = i
            break
    if changelog_idx is None:
        # No recognizable ChangeLog section — leave header untouched.
        return header_lines

    today_str = datetime.now(timezone.utc).strftime("%B %-d, %Y")

    # Is the very next content line already today's date?
    next_idx = changelog_idx + 1
    existing_date_line = (
        re.sub(r"^;\s*", "", header_lines[next_idx].rstrip("\n")).strip()
        if next_idx < len(header_lines)
        else ""
    )

    if existing_date_line == today_str:
        # Append to today's existing entries instead of duplicating the date.
        insert_at = next_idx + 1
        existing_count = 0
        while insert_at < len(header_lines):
            stripped = header_lines[insert_at].strip()
            if stripped.startswith(";") and stripped.lstrip(";").strip()[:1].isdigit():
                existing_count += 1
                insert_at += 1
            else:
                break
        new_lines = [
            f"; {existing_count + i}. {msg}\n"
            for i, msg in enumerate(bullet_messages, start=1)
        ]
        return header_lines[:insert_at] + new_lines + header_lines[insert_at:]

    # Otherwise, insert a brand new dated block right after "ChangeLog:",
    # ahead of any older entries (most recent stays on top).
    new_block = [f"; {today_str}\n"]
    new_block += [f"; {i}. {msg}\n" for i, msg in enumerate(bullet_messages, start=1)]
    insert_at = changelog_idx + 1
    return header_lines[:insert_at] + new_block + header_lines[insert_at:]


# --------------------------------------------------------------------------
# Git helpers
# --------------------------------------------------------------------------

def get_previous_committed_lines(repo_relative_path: str) -> list[str] | None:
    """Return the file's content as of the commit BEFORE the current one,
    or None if this file has no prior committed version (brand new file)."""
    try:
        result = subprocess.run(
            ["git", "log", "-n", "2", "--format=%H", "--", repo_relative_path],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            check=True,
        )
    except subprocess.CalledProcessError:
        return None

    commits = [c for c in result.stdout.splitlines() if c.strip()]
    if len(commits) < 2:
        return None

    previous_sha = commits[1]
    try:
        show = subprocess.run(
            ["git", "show", f"{previous_sha}:{repo_relative_path}"],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            check=True,
        )
    except subprocess.CalledProcessError:
        return None

    return show.stdout.splitlines(keepends=True)


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------

def process_file(path: Path, forbidden: set[str]) -> bool:
    """Returns True if the file was modified on disk."""
    repo_relative_path = path.relative_to(REPO_ROOT).as_posix()

    original_lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
    header_lines, body_lines, _ = split_header_body(original_lines)

    cleaned_body, removed = strip_forbidden(body_lines, forbidden)
    if removed:
        print(f"\n🧹 Cleaned {repo_relative_path}:")
        for line in removed:
            print(f"   - removed: {line.strip()}")

    old_lines = get_previous_committed_lines(repo_relative_path)

    header_updated = header_lines
    if header_lines:
        header_updated = update_link_line(header_updated, repo_relative_path)

        if old_lines is not None:
            _, old_body, _ = split_header_body(old_lines)
            bullet_messages = diff_cvars(old_body, cleaned_body)
            if bullet_messages:
                print(f"\n📝 Changelog entry for {repo_relative_path}:")
                for msg in bullet_messages:
                    print(f"   - {msg}")
                header_updated = insert_changelog_entry(header_updated, bullet_messages)
        else:
            print(f"\nℹ️  {repo_relative_path} has no prior commit — skipping changelog diff, link still refreshed.")

    new_lines = header_updated + cleaned_body
    if new_lines != original_lines:
        path.write_text("".join(new_lines), encoding="utf-8")
        return True
    return False


def main() -> int:
    if not FORBIDDEN_LIST_PATH.exists():
        print(f"Forbidden CVar list not found at {FORBIDDEN_LIST_PATH}", file=sys.stderr)
        return 2

    forbidden = load_forbidden_cvars(FORBIDDEN_LIST_PATH)
    config_dir = REPO_ROOT / CONFIG_DIR_NAME

    if not config_dir.exists():
        print(f'Config folder "{CONFIG_DIR_NAME}" not found — nothing to scan.')
        return 0

    any_changes = False
    for ini_path in sorted(config_dir.rglob("*.ini")):
        if ini_path.name.lower() not in TARGET_FILENAMES:
            continue
        if process_file(ini_path, forbidden):
            any_changes = True

    if not any_changes:
        print("✅ No forbidden CVars and no CVar changes detected. Nothing to update.")
        return 0

    print("\n⚠️  Files were updated (CVars stripped and/or headers refreshed).")
    return 1


if __name__ == "__main__":
    sys.exit(main())