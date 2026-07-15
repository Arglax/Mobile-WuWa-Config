#!/usr/bin/env python3
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]  # .github/scripts/ -> repo root
CONFIG_DIR_NAME = "[V3.x] Working Configs"
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


def extract_key(line: str) -> str | None:
    """Return the CVar key from an active ini line, or None if not applicable."""
    stripped = line.strip()
    if not stripped or stripped.startswith((";", "#", "[")):
        return None
    if "=" not in stripped:
        return None
    key = stripped.split("=", 1)[0].strip()
    return key.lower() if key else None


def clean_file(path: Path, forbidden: set[str]) -> list[str]:
    """Remove forbidden CVar lines in-place. Returns list of removed raw lines."""
    original_lines = path.read_text(encoding="utf-8").splitlines(keepends=True)
    kept_lines = []
    removed = []

    for line in original_lines:
        key = extract_key(line)
        if key in forbidden:
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
    config_dir = REPO_ROOT / CONFIG_DIR_NAME

    if not config_dir.exists():
        print(f'Config folder "{CONFIG_DIR_NAME}" not found — nothing to scan.')
        return 0

    any_changes = False
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