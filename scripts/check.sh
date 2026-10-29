#!/usr/bin/env bash
# Validate the DSH Workflow repository and exercise its scripts in isolated homes.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INSTALL="$ROOT/scripts/install.sh"
INIT_PROJECT="$ROOT/scripts/init-project.sh"
SKILLS=(quick-fix spec build verify review test-design)

CHECKS=0
FAILURES=0

ok() {
  CHECKS=$((CHECKS + 1))
  printf 'ok   %s\n' "$1"
}

fail() {
  CHECKS=$((CHECKS + 1))
  FAILURES=$((FAILURES + 1))
  printf 'FAIL %s\n' "$1" >&2
}

section() {
  printf '\n== %s ==\n' "$1"
}

require_file() {
  if [ -f "$ROOT/$1" ]; then
    ok "file $1"
  else
    fail "missing file $1"
  fi
}

require_markdown() {
  file="$ROOT/$1"
  if [ ! -f "$file" ]; then
    fail "missing document $1"
    return
  fi
  if [ ! -s "$file" ]; then
    fail "empty document $1"
    return
  fi
  if head -n 1 "$file" | grep -q '^# '; then
    ok "document $1"
  else
    fail "document $1 does not start with an H1"
  fi
}

strip_value() {
  value="$1"
  case "$value" in
    \"*\") value="${value#\"}"; value="${value%\"}" ;;
    \'*\') value="${value#\'}"; value="${value%\'}" ;;
  esac
  printf '%s' "$value"
}

check_skill() {
  skill="$1"
  file="$ROOT/skills/$skill/SKILL.md"
  if [ ! -f "$file" ]; then
    fail "skill $skill is missing"
    return
  fi

  first="$(sed -n '1p' "$file")"
  if [ "$first" != "---" ]; then
    fail "skill $skill does not start with YAML frontmatter"
    return
  fi

  close="$(awk 'NR > 1 && $0 == "---" { print NR; exit }' "$file")"
  if [ -z "$close" ]; then
    fail "skill $skill has no closing frontmatter delimiter"
    return
  fi

  frontmatter="$(sed -n "2,$((close - 1))p" "$file")"
  name="$(strip_value "$(printf '%s\n' "$frontmatter" | sed -n 's/^name:[[:space:]]*//p' | head -n 1)")"
  description="$(strip_value "$(printf '%s\n' "$frontmatter" | sed -n 's/^description:[[:space:]]*//p' | head -n 1)")"

  if [ "$name" != "$skill" ]; then
    fail "skill $skill frontmatter name is '$name'"
  elif printf '%s' "$name" | grep -Eq '^[a-z0-9]+(-[a-z0-9]+)*$'; then
    ok "skill $skill name"
  else
    fail "skill $skill name is not kebab-case"
  fi

  if [ -n "$description" ]; then
    ok "skill $skill description"
  else
    fail "skill $skill has no description"
  fi

  unknown="$(printf '%s\n' "$frontmatter" \
    | sed -n 's/^\([A-Za-z][A-Za-z0-9_-]*\):.*/\1/p' \
    | grep -v -x -E 'name|description|whenToUse|metadata|disable-model-invocation|user-invocable' || true)"
  if [ -z "$unknown" ]; then
    ok "skill $skill frontmatter keys"
  else
    fail "skill $skill has unsupported frontmatter keys: $unknown"
  fi

  if printf '%s\n' "$frontmatter" | grep -q "$(printf '\t')"; then
    fail "skill $skill frontmatter contains a tab"
  fi

  if tail -n "+$((close + 1))" "$file" | grep -q '[^[:space:]]'; then
    ok "skill $skill instruction body"
  else
    fail "skill $skill instruction body is empty"
  fi

  extra="$(find "$ROOT/skills/$skill" -mindepth 1 -maxdepth 1 ! -name 'SKILL.md' -print)"
  if [ -z "$extra" ]; then
    ok "skill $skill bundle layout"
  else
    fail "skill $skill contains unexpected files: $extra"
  fi
}

printf 'DSH Workflow checks\n'
printf 'Repository: %s\n' "$ROOT"

section "Required files"
for file in \
  README.md \
  AGENTS.md \
  global/AGENTS.md \
  docs/WORKFLOW.md \
  docs/DSH-CAPABILITY-MAP.md \
  docs/QUALITY-POLICY.md \
  docs/REVIEW-POLICY.md \
  docs/SECURITY.md \
  templates/project/AGENTS.md \
  templates/project/docs/PRODUCT.md \
  templates/project/docs/ARCHITECTURE.md \
  templates/project/docs/DESIGN.md \
  templates/project/docs/QUALITY.md \
  scripts/install.sh \
  scripts/init-project.sh \
  scripts/check.sh \
  .github/workflows/quality.yml; do
  require_file "$file"
done
for skill in "${SKILLS[@]}"; do
  require_file "skills/$skill/SKILL.md"
done

section "Documents"
for file in \
  README.md \
  AGENTS.md \
  global/AGENTS.md \
  docs/WORKFLOW.md \
  docs/DSH-CAPABILITY-MAP.md \
  docs/QUALITY-POLICY.md \
  docs/REVIEW-POLICY.md \
  docs/SECURITY.md \
  templates/project/AGENTS.md \
  templates/project/docs/PRODUCT.md \
  templates/project/docs/ARCHITECTURE.md \
  templates/project/docs/DESIGN.md \
  templates/project/docs/QUALITY.md; do
  require_markdown "$file"
done

section "Skills"
for skill in "${SKILLS[@]}"; do
  check_skill "$skill"
done

for entry in "$ROOT"/skills/*; do
  [ -d "$entry" ] || continue
  base="$(basename "$entry")"
  case " ${SKILLS[*]} " in
    *" $base "*) ;;
    *) fail "unexpected skill directory: skills/$base" ;;
  esac
done

section "Shell scripts"
for script in "$INSTALL" "$INIT_PROJECT" "$ROOT/scripts/check.sh"; do
  name="$(basename "$script")"
  if [ -x "$script" ]; then
    ok "$name is executable"
  else
    fail "$name is not executable"
  fi
  if bash -n "$script"; then
    ok "$name syntax"
  else
    fail "$name syntax"
  fi
done

section "Documentation consistency"
for skill in "${SKILLS[@]}"; do
  for doc in README.md global/AGENTS.md docs/WORKFLOW.md; do
    if grep -q -- "$skill" "$ROOT/$doc"; then
      ok "$doc names $skill"
    else
      fail "$doc does not name $skill"
    fi
  done
done

for doc in docs/WORKFLOW.md docs/DSH-CAPABILITY-MAP.md docs/QUALITY-POLICY.md docs/REVIEW-POLICY.md docs/SECURITY.md; do
  if grep -q -- "$(basename "$doc")" "$ROOT/README.md"; then
    ok "README links $doc"
  else
    fail "README does not link $doc"
  fi
done

if grep -q 'runtime-unverified' "$ROOT/docs/DSH-CAPABILITY-MAP.md"; then
  ok "capability map marks unverified runtime behavior"
else
  fail "capability map does not mark unverified runtime behavior"
fi

section "CI workflow"
WORKFLOW="$ROOT/.github/workflows/quality.yml"
if grep -q 'scripts/check.sh' "$WORKFLOW"; then
  ok "CI runs scripts/check.sh"
else
  fail "CI does not run scripts/check.sh"
fi
if grep -Eq 'uses:[[:space:]]+actions/checkout@[0-9a-f]{40}' "$WORKFLOW"; then
  ok "CI pins actions/checkout to a full SHA"
else
  fail "CI does not pin actions/checkout to a full SHA"
fi
if grep -Eq '^[[:space:]]*contents:[[:space:]]*read[[:space:]]*$' "$WORKFLOW"; then
  ok "CI repository permission is read-only"
else
  fail "CI does not declare contents: read"
fi
if grep -q 'pull_request_target' "$WORKFLOW"; then
  fail "CI uses pull_request_target"
else
  ok "CI does not use pull_request_target"
fi
if grep -q 'secrets\.' "$WORKFLOW"; then
  fail "CI references repository secrets"
else
  ok "CI does not reference repository secrets"
fi

section "Script help and argument handling"
if HOME="${HOME:-/tmp}" bash "$INSTALL" --help >/dev/null 2>&1; then
  ok "install.sh --help"
else
  fail "install.sh --help"
fi
if HOME="${HOME:-/tmp}" bash "$INIT_PROJECT" --help >/dev/null 2>&1; then
  ok "init-project.sh --help"
else
  fail "init-project.sh --help"
fi

TMP_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/dsh-workflow-check.XXXXXX")" || {
  fail "could not create a temporary directory"
  printf '\n%d checks, %d failure(s)\n' "$CHECKS" "$FAILURES"
  exit 1
}
trap 'rm -rf "$TMP_ROOT"' EXIT

FAKE_HOME="$TMP_ROOT/home"
ISO_DSH="$TMP_ROOT/dsh-home"
REAL_DSH="${DSH_HOME:-${HOME:-}/.dsh}"
if [ -n "${HOME:-}" ]; then
  case "$ISO_DSH" in
    "$HOME"|"$HOME"/*|"$REAL_DSH"|"$REAL_DSH"/*)
      fail "temporary DSH home overlaps the real home; refusing to run tests"
      printf '\n%d checks, %d failure(s)\n' "$CHECKS" "$FAILURES"
      exit 1
      ;;
  esac
fi
mkdir -p "$FAKE_HOME" "$ISO_DSH/profiles/web"
printf 'placeholder credential\n' > "$ISO_DSH/.credentials.yaml"
printf 'placeholder profile\n' > "$ISO_DSH/profiles/web/cordis.patch.yml"
cp "$ISO_DSH/.credentials.yaml" "$TMP_ROOT/credentials.before"
cp "$ISO_DSH/profiles/web/cordis.patch.yml" "$TMP_ROOT/profile.before"

run_install() {
  : > "$TMP_ROOT/install.out"
  HOME="$FAKE_HOME" DSH_HOME="$ISO_DSH" bash "$INSTALL" "$@" >"$TMP_ROOT/install.out" 2>&1
}

section "Installer dry run and installation"
if run_install --dry-run; then
  ok "installer --dry-run exits successfully"
else
  fail "installer --dry-run failed"
fi
if [ ! -e "$ISO_DSH/AGENTS.md" ] && [ ! -e "$ISO_DSH/skills" ]; then
  ok "dry run created nothing"
else
  fail "dry run created files"
fi

if run_install; then
  ok "installer completes"
else
  fail "installer failed"
  sed -n '1,80p' "$TMP_ROOT/install.out" >&2
fi

for file in AGENTS.md skills/quick-fix/SKILL.md skills/spec/SKILL.md skills/build/SKILL.md \
  skills/verify/SKILL.md skills/review/SKILL.md skills/test-design/SKILL.md; do
  if [ -f "$ISO_DSH/$file" ]; then
    ok "installed $file"
  else
    fail "not installed: $file"
  fi
done

if cmp -s "$TMP_ROOT/credentials.before" "$ISO_DSH/.credentials.yaml" \
  && cmp -s "$TMP_ROOT/profile.before" "$ISO_DSH/profiles/web/cordis.patch.yml"; then
  ok "installer left credentials and profile untouched"
else
  fail "installer modified credentials or profile"
fi

if cmp -s "$ROOT/global/AGENTS.md" "$ISO_DSH/AGENTS.md"; then
  ok "installed global instructions match the source"
else
  fail "installed global instructions differ from the source"
fi
for skill in "${SKILLS[@]}"; do
  if cmp -s "$ROOT/skills/$skill/SKILL.md" "$ISO_DSH/skills/$skill/SKILL.md"; then
    ok "installed skill $skill matches the source"
  else
    fail "installed skill $skill differs from the source"
  fi
done

if [ -s "$ISO_DSH/AGENTS.md" ]; then
  ok "installed global instructions are non-empty"
else
  fail "installed global instructions are empty"
fi

section "Installer idempotence and conflicts"
if run_install; then
  ok "repeat installation exits successfully"
else
  fail "repeat installation failed"
  sed -n '1,80p' "$TMP_ROOT/install.out" >&2
fi
if grep -q '0 installed' "$TMP_ROOT/install.out"; then
  ok "repeat installation reports no new files"
else
  fail "repeat installation did not report 0 installed"
fi

printf '\nconflict-marker\n' >> "$ISO_DSH/skills/review/SKILL.md"
if run_install; then
  fail "conflicting installation unexpectedly succeeded"
else
  ok "conflicting installation exits nonzero"
fi
if grep -q 'conflict-marker' "$ISO_DSH/skills/review/SKILL.md"; then
  ok "conflicting installation preserved the existing file"
else
  fail "conflicting installation overwrote the existing file"
fi
if grep -q 'CONFLICT' "$TMP_ROOT/install.out"; then
  ok "conflicting installation reported the conflict"
else
  fail "conflicting installation did not report the conflict"
fi

if run_install --force; then
  ok "forced installation succeeds"
else
  fail "forced installation failed"
fi
if grep -q 'conflict-marker' "$ISO_DSH/skills/review/SKILL.md"; then
  fail "forced installation did not replace the file"
else
  ok "forced installation replaced the file"
fi
BACKUP="$(find "$ISO_DSH/skills/review" -maxdepth 1 -name 'SKILL.md.bak.*' -print -quit)"
if [ -n "$BACKUP" ] && grep -q 'conflict-marker' "$BACKUP"; then
  ok "forced installation created a backup"
else
  fail "forced installation did not create a usable backup"
fi

EXTERNAL_TARGET="$TMP_ROOT/external-target"
printf 'external-content\n' > "$EXTERNAL_TARGET"
rm -f "$ISO_DSH/skills/build/SKILL.md"
ln -s "$EXTERNAL_TARGET" "$ISO_DSH/skills/build/SKILL.md"
if run_install; then
  fail "symlinked skill conflict unexpectedly succeeded"
else
  ok "symlinked skill conflict exits nonzero"
fi
if [ -L "$ISO_DSH/skills/build/SKILL.md" ] && grep -q 'external-content' "$EXTERNAL_TARGET"; then
  ok "symlinked skill and its target are preserved"
else
  fail "symlinked skill or its target was modified"
fi
if run_install --force; then
  ok "forced installation replaces a symlink"
else
  fail "forced installation failed on a symlink"
fi
if [ ! -L "$ISO_DSH/skills/build/SKILL.md" ] \
  && cmp -s "$ROOT/skills/build/SKILL.md" "$ISO_DSH/skills/build/SKILL.md"; then
  ok "forced installation wrote a regular skill file"
else
  fail "forced installation did not replace the symlink with a regular file"
fi
if grep -q 'external-content' "$EXTERNAL_TARGET"; then
  ok "forced installation did not write through the symlink"
else
  fail "forced installation modified the symlink target"
fi

printf '\nsecond-conflict-marker\n' >> "$ISO_DSH/AGENTS.md"
if run_install --dry-run; then
  ok "conflict dry run exits successfully"
else
  fail "conflict dry run failed"
fi
if grep -q 'second-conflict-marker' "$ISO_DSH/AGENTS.md"; then
  ok "conflict dry run preserved the existing file"
else
  fail "conflict dry run modified the existing file"
fi
if grep -q 'second-conflict-marker' "$ISO_DSH/AGENTS.md" \
  && cmp -s "$TMP_ROOT/credentials.before" "$ISO_DSH/.credentials.yaml"; then
  ok "conflict dry run left unrelated files untouched"
else
  fail "conflict dry run touched unrelated files"
fi

section "Installer path safety"
ALT_DSH="$TMP_ROOT/alt-dsh"
if HOME="$FAKE_HOME" DSH_HOME="$ISO_DSH" bash "$INSTALL" --dsh-home "$ALT_DSH" >"$TMP_ROOT/alt.out" 2>&1; then
  if [ -f "$ALT_DSH/AGENTS.md" ]; then
    ok "--dsh-home selects the target"
  else
    fail "--dsh-home did not install into the selected target"
  fi
else
  fail "--dsh-home installation failed"
fi

ALT_EQUALS="$TMP_ROOT/alt-equals"
if HOME="$FAKE_HOME" DSH_HOME="$ISO_DSH" bash "$INSTALL" "--dsh-home=$ALT_EQUALS" >"$TMP_ROOT/alt-equals.out" 2>&1 \
  && [ -f "$ALT_EQUALS/AGENTS.md" ]; then
  ok "--dsh-home=... form selects the target"
else
  fail "--dsh-home=... form failed"
fi

if env -u HOME -u DSH_HOME bash "$INSTALL" --dry-run >/dev/null 2>&1; then
  fail "installer accepted a missing HOME without a target"
else
  ok "missing HOME without a target is rejected"
fi

if HOME="$FAKE_HOME" DSH_HOME="$ISO_DSH" bash "$INSTALL" --bogus >/dev/null 2>&1; then
  fail "unknown option was accepted"
else
  ok "unknown option is rejected"
fi
if HOME="$FAKE_HOME" DSH_HOME="$ISO_DSH" bash "$INSTALL" --dsh-home "" >/dev/null 2>&1; then
  fail "empty --dsh-home was accepted"
else
  ok "empty --dsh-home is rejected"
fi
if bash "$INSTALL" --dsh-home / --dry-run >/dev/null 2>&1; then
  fail "filesystem root was accepted as DSH home"
else
  ok "filesystem root is rejected as DSH home"
fi

section "Project initializer"
PROJECT="$TMP_ROOT/project"
mkdir -p "$PROJECT/docs"
printf 'existing project instructions\n' > "$PROJECT/AGENTS.md"
printf 'existing product document\n' > "$PROJECT/docs/PRODUCT.md"
cp "$PROJECT/AGENTS.md" "$TMP_ROOT/project-agents.before"
cp "$PROJECT/docs/PRODUCT.md" "$TMP_ROOT/project-product.before"

if bash "$INIT_PROJECT" --dry-run "$PROJECT" >"$TMP_ROOT/init-dry.out" 2>&1; then
  if [ ! -e "$PROJECT/docs/ARCHITECTURE.md" ]; then
    ok "project dry run created nothing"
  else
    fail "project dry run created files"
  fi
else
  fail "project initializer dry run failed"
fi

if bash "$INIT_PROJECT" "$PROJECT" >"$TMP_ROOT/init.out" 2>&1; then
  ok "project initializer completes"
else
  fail "project initializer failed"
  sed -n '1,80p' "$TMP_ROOT/init.out" >&2
fi
if cmp -s "$TMP_ROOT/project-agents.before" "$PROJECT/AGENTS.md" \
  && cmp -s "$TMP_ROOT/project-product.before" "$PROJECT/docs/PRODUCT.md"; then
  ok "project initializer preserved existing documents"
else
  fail "project initializer overwrote existing documents"
fi
for file in docs/ARCHITECTURE.md docs/DESIGN.md docs/QUALITY.md; do
  if [ -f "$PROJECT/$file" ]; then
    ok "project initializer created $file"
  else
    fail "project initializer did not create $file"
  fi
done

printf '\ncustom quality content\n' > "$PROJECT/docs/QUALITY.md"
if bash "$INIT_PROJECT" "$PROJECT" >/dev/null 2>&1; then
  if grep -q 'custom quality content' "$PROJECT/docs/QUALITY.md"; then
    ok "project initializer is repeatable and non-destructive"
  else
    fail "project initializer overwrote a custom document on repeat"
  fi
else
  fail "repeat project initializer failed"
fi

if bash "$INIT_PROJECT" "$TMP_ROOT/does-not-exist" >/dev/null 2>&1; then
  fail "project initializer accepted a missing target"
else
  ok "project initializer rejects a missing target"
fi

printf '\n'
printf '%d checks, %d failure(s)\n' "$CHECKS" "$FAILURES"
if [ "$FAILURES" -ne 0 ]; then
  printf 'Checks failed.\n' >&2
  exit 1
fi
printf 'All checks passed.\n'
