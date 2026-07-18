#!/usr/bin/env python3
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]  # .github/scripts/ -> repo root
FORBIDDEN_LIST_PATH = REPO_ROOT / ".github" / "forbidden_cvars.txt"
TARGET_FILENAMES = {"engine.ini", "deviceprofiles.ini"}


def load_forbidden_cvars(path: Path) -> set[str]:
    cvars = set()
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        cvars.add(line.lower())
    return cvars


def is_line_forbidden(line: str, forbidden: set[str]) -> bool:
    """Return True if line is active (not commented) and contains any forbidden CVar."""
    stripped = line.strip()
    if not stripped or stripped.startswith(("#", ";", "[")):
        return False
    line_lower = stripped.lower()
    return any(cvar in line_lower for cvar in forbidden)


def clean_file(path: Path, forbidden: set[str]) -> list[str]:
    """Remove forbidden CVar lines in-place (whole line). Returns list of removed raw lines."""
    original_lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
    kept_lines = []
    removed = []

    for line in original_lines:
        if is_line_forbidden(line, forbidden):
            removed.append(line.rstrip("\n"))
            continue
        kept_lines.append(line)

    if removed:
        path.write_text("".join(kept_lines), encoding="utf-8")

    return removed


def main() -> int:
    if not FORBIDDEN_LIST_PATH.exists():
        print(f"Forbidden CVar list not found at {FORBIDDEN_LIST_PATH}", file=sys.stderr)
        return 2

    forbidden = load_forbidden_cvars(FORBIDDEN_LIST_PATH)

    any_changes = False
    for dir_name in ["[V3.x] Working Configs", "Community Configs"]:
        config_dir = REPO_ROOT / dir_name
        if not config_dir.exists():
            print(f'Config folder "{dir_name}" not found — skipping.')
            continue
        for ini_path in config_dir.rglob("*.ini"):
            if ini_path.name.lower() not in TARGET_FILENAMES:
                continue
            removed = clean_file(ini_path, forbidden)
            if removed:
                any_changes = True
                rel = ini_path.relative_to(REPO_ROOT)
                print(f"\n🧹 Cleaned {rel}:")
                for line in removed:
                    print(f"   - removed: {line.strip()}")

    if not any_changes:
        print("✅ No forbidden CVars found. All configs clean.")
        return 0

    print("\n⚠️  Forbidden CVars were removed. Files updated.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
