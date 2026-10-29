#!/usr/bin/env bash
# Install the DSH Workflow global instructions and skills.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

SKILLS=(quick-fix spec build verify review test-design)

DRY_RUN=0
FORCE=0
DSH_HOME_SET=0
DSH_HOME_ARG=""

usage() {
  cat <<'EOF'
Usage: scripts/install.sh [options]

Install the DSH Workflow global instructions and skills into the DSH home.
The default target is $DSH_HOME, or ~/.dsh when DSH_HOME is unset.

Options:
  --dry-run        Show planned actions without modifying anything.
  --force          Replace conflicting files after a timestamped backup.
  --dsh-home PATH  Use PATH instead of $DSH_HOME or ~/.dsh.
  -h, --help       Show this help.

Writes only:
  PATH/AGENTS.md
  PATH/skills/<name>/SKILL.md

Never modifies profiles, credentials, sessions, storages, or projects.
Exit codes: 0 success, 1 conflicts, 2 usage or environment error.
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
    --force)
      FORCE=1
      ;;
    --dsh-home)
      [ "$#" -ge 2 ] || die "--dsh-home requires a path"
      DSH_HOME_SET=1
      DSH_HOME_ARG="$2"
      shift
      ;;
    --dsh-home=*)
      DSH_HOME_SET=1
      DSH_HOME_ARG="${1#*=}"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf 'error: unknown option: %s\n\n' "$1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

if [ "$DSH_HOME_SET" -eq 1 ]; then
  [ -n "$DSH_HOME_ARG" ] || die "--dsh-home requires a non-empty path"
else
  DSH_HOME_ARG="${DSH_HOME:-}"
fi

if [ -n "$DSH_HOME_ARG" ]; then
  DSH_ROOT="$DSH_HOME_ARG"
else
  [ -n "${HOME:-}" ] || die "HOME is not set; use --dsh-home PATH"
  DSH_ROOT="$HOME/.dsh"
fi

case "$DSH_ROOT" in
  "~")
    [ -n "${HOME:-}" ] || die "HOME is not set; use an absolute --dsh-home PATH"
    DSH_ROOT="$HOME"
    ;;
  "~/"*)
    [ -n "${HOME:-}" ] || die "HOME is not set; use an absolute --dsh-home PATH"
    DSH_ROOT="$HOME/${DSH_ROOT#\~/}"
    ;;
esac

case "$DSH_ROOT" in
  /*) ;;
  *) DSH_ROOT="$(pwd)/$DSH_ROOT" ;;
esac

# Reject the filesystem root and normalize one trailing separator.
[ "$DSH_ROOT" != "/" ] || die "refusing to install into /"
DSH_ROOT="${DSH_ROOT%/}"
[ -n "$DSH_ROOT" ] || die "invalid DSH home"
[ "$DSH_ROOT" != "/" ] || die "refusing to install into /"

if [ -e "$DSH_ROOT" ] && [ ! -d "$DSH_ROOT" ]; then
  die "DSH home exists but is not a directory: $DSH_ROOT"
fi
if [ -e "$DSH_ROOT/skills" ] && [ ! -d "$DSH_ROOT/skills" ]; then
  die "skills path exists but is not a directory: $DSH_ROOT/skills"
fi

GLOBAL_SRC="$REPO_ROOT/global/AGENTS.md"
[ -f "$GLOBAL_SRC" ] || die "missing source file: $GLOBAL_SRC"
for skill in "${SKILLS[@]}"; do
  [ -f "$REPO_ROOT/skills/$skill/SKILL.md" ] || die "missing source skill: skills/$skill/SKILL.md"
done

INSTALLED=0
UNCHANGED=0
BACKED_UP=0
CONFLICTS=0
PLANNED=0

backup_file() {
  BACKUP_PATH="$1.bak.$(date +%Y%m%d%H%M%S)"
  suffix=1
  while [ -e "$BACKUP_PATH" ] || [ -L "$BACKUP_PATH" ]; do
    BACKUP_PATH="$1.bak.$(date +%Y%m%d%H%M%S).$suffix"
    suffix=$((suffix + 1))
  done
  if cp -pP "$1" "$BACKUP_PATH" 2>/dev/null; then
    return 0
  fi
  cp -p "$1" "$BACKUP_PATH"
}

install_file() {
  src="$1"
  dest="$2"
  parent="$(dirname "$dest")"

  if [ -e "$parent" ] && [ ! -d "$parent" ]; then
    CONFLICTS=$((CONFLICTS + 1))
    printf 'CONFLICT %s: parent path is not a directory\n' "$dest" >&2
    return 0
  fi

  if [ -L "$dest" ] || [ -f "$dest" ]; then
    if cmp -s "$src" "$dest"; then
      UNCHANGED=$((UNCHANGED + 1))
      printf 'unchanged %s\n' "$dest"
      return 0
    fi

    if [ "$FORCE" -eq 0 ]; then
      CONFLICTS=$((CONFLICTS + 1))
      printf 'CONFLICT %s: existing file differs; not overwritten\n' "$dest" >&2
      return 0
    fi

    if [ "$DRY_RUN" -eq 1 ]; then
      PLANNED=$((PLANNED + 1))
      printf '[dry-run] would back up and replace %s\n' "$dest"
      return 0
    fi

    backup_file "$dest" || die "could not back up $dest"
    rm -f "$dest" || die "could not replace $dest"
    BACKED_UP=$((BACKED_UP + 1))
    printf 'backed up %s -> %s\n' "$dest" "$BACKUP_PATH"
  elif [ -e "$dest" ] || [ -L "$dest" ]; then
    CONFLICTS=$((CONFLICTS + 1))
    printf 'CONFLICT %s: exists and is not a regular file; not touched\n' "$dest" >&2
    return 0
  fi

  if [ "$DRY_RUN" -eq 1 ]; then
    PLANNED=$((PLANNED + 1))
    printf '[dry-run] would install %s\n' "$dest"
    return 0
  fi

  mkdir -p "$parent" || die "could not create directory: $parent"
  cp -p "$src" "$dest" || die "could not install $dest"
  INSTALLED=$((INSTALLED + 1))
  printf 'installed %s\n' "$dest"
}

printf 'DSH Workflow v0.1\n'
printf 'Source: %s\n' "$REPO_ROOT"
printf 'Target: %s\n\n' "$DSH_ROOT"

if [ "$DRY_RUN" -eq 1 ]; then
  printf 'Dry run: no files will be changed.\n\n'
fi

install_file "$GLOBAL_SRC" "$DSH_ROOT/AGENTS.md"
for skill in "${SKILLS[@]}"; do
  install_file "$REPO_ROOT/skills/$skill/SKILL.md" "$DSH_ROOT/skills/$skill/SKILL.md"
done

printf '\n'
if [ "$DRY_RUN" -eq 1 ]; then
  printf 'Dry run complete: %d would be installed, %d conflicts, %d unchanged.\n' \
    "$PLANNED" "$CONFLICTS" "$UNCHANGED"
  if [ "$CONFLICTS" -gt 0 ]; then
    printf 'Rerun without --dry-run to install non-conflicting files; review conflicts first.\n'
  fi
  exit 0
fi

printf 'Result: %d installed, %d unchanged, %d backups, %d conflicts.\n' \
  "$INSTALLED" "$UNCHANGED" "$BACKED_UP" "$CONFLICTS"

if [ "$CONFLICTS" -gt 0 ]; then
  printf 'Nothing was overwritten for the conflicting paths.\n' >&2
  printf 'Merge them manually or rerun with --force to create backups and replace them.\n' >&2
  exit 1
fi

printf '\nStart a new DSH session to pick up the global instructions.\n'
printf 'Use /quick-fix, /spec, /build, /verify, /review, or /test-design as needed.\n'
