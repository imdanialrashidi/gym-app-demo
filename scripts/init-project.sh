#!/usr/bin/env bash
# Create the agreed DSH Workflow project documents without overwriting anything.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMPLATES="$REPO_ROOT/templates/project"

DRY_RUN=0
TARGET_SET=0
TARGET_ARG="."

usage() {
  cat <<'EOF'
Usage: scripts/init-project.sh [--dry-run] [--] [TARGET]

Create the DSH Workflow project entry point and documents in TARGET
(default: the current directory). TARGET must already exist.

Creates only when missing:
  TARGET/AGENTS.md
  TARGET/docs/PRODUCT.md
  TARGET/docs/ARCHITECTURE.md
  TARGET/docs/DESIGN.md
  TARGET/docs/QUALITY.md

Existing files are never overwritten. There is no force mode, by design.
Options:
  --dry-run   Show what would be created; modify nothing.
  -h, --help  Show this help.
EOF
}

die() {
  printf 'error: %s\n' "$*" >&2
  exit 2
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --dry-run)
      DRY_RUN=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    --)
      shift
      [ "$#" -eq 1 ] || die "-- expects exactly one target directory"
      TARGET_SET=1
      TARGET_ARG="$1"
      shift
      continue
      ;;
    -*)
      printf 'error: unknown option: %s\n\n' "$1" >&2
      usage >&2
      exit 2
      ;;
    *)
      if [ "$TARGET_SET" -eq 1 ]; then
        die "only one target directory is supported"
      fi
      TARGET_SET=1
      TARGET_ARG="$1"
      ;;
  esac
  shift
done

[ -d "$TARGET_ARG" ] || die "target does not exist or is not a directory: $TARGET_ARG"

TARGET="$(cd "$TARGET_ARG" && pwd -P)"
[ -d "$TARGET" ] || die "cannot resolve target directory: $TARGET_ARG"

if [ -e "$TARGET/docs" ] && [ ! -d "$TARGET/docs" ]; then
  die "docs exists but is not a directory: $TARGET/docs"
fi

for src in \
  "$TEMPLATES/AGENTS.md" \
  "$TEMPLATES/docs/PRODUCT.md" \
  "$TEMPLATES/docs/ARCHITECTURE.md" \
  "$TEMPLATES/docs/DESIGN.md" \
  "$TEMPLATES/docs/QUALITY.md"; do
  [ -f "$src" ] || die "missing template: $src"
done

CREATED=0
PRESERVED=0

copy_if_missing() {
  src="$1"
  dest="$2"
  parent="$(dirname "$dest")"

  if [ -e "$dest" ] || [ -L "$dest" ]; then
    PRESERVED=$((PRESERVED + 1))
    printf 'preserved %s\n' "$dest"
    return 0
  fi

  if [ -e "$parent" ] && [ ! -d "$parent" ]; then
    die "parent path is not a directory: $parent"
  fi

  if [ "$DRY_RUN" -eq 1 ]; then
    CREATED=$((CREATED + 1))
    printf '[dry-run] would create %s\n' "$dest"
    return 0
  fi

  mkdir -p "$parent" || die "could not create directory: $parent"
  cp -p "$src" "$dest" || die "could not create $dest"
  CREATED=$((CREATED + 1))
  printf 'created %s\n' "$dest"
}

printf 'DSH Workflow project initializer\n'
printf 'Template: %s\n' "$TEMPLATES"
printf 'Target: %s\n\n' "$TARGET"

if [ "$DRY_RUN" -eq 1 ]; then
  printf 'Dry run: no files will be changed.\n\n'
fi

copy_if_missing "$TEMPLATES/AGENTS.md" "$TARGET/AGENTS.md"
copy_if_missing "$TEMPLATES/docs/PRODUCT.md" "$TARGET/docs/PRODUCT.md"
copy_if_missing "$TEMPLATES/docs/ARCHITECTURE.md" "$TARGET/docs/ARCHITECTURE.md"
copy_if_missing "$TEMPLATES/docs/DESIGN.md" "$TARGET/docs/DESIGN.md"
copy_if_missing "$TEMPLATES/docs/QUALITY.md" "$TARGET/docs/QUALITY.md"

printf '\n'
if [ "$DRY_RUN" -eq 1 ]; then
  printf 'Dry run complete: %d would be created, %d preserved.\n' "$CREATED" "$PRESERVED"
  exit 0
fi

printf 'Result: %d created, %d preserved.\n' "$CREATED" "$PRESERVED"
printf 'Next: fill the placeholders and remove sections that do not apply.\n'
printf 'Install the global DSH Workflow with scripts/install.sh if you have not already.\n'
