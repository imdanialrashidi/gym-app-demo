# DSH Workflow

A small, repository-independent coding workflow for [DeepSeek Harness (DSH)](https://github.com/deepseek-ai/deepseek-harness). Version 0.1 provides global instructions, six DSH skills, project documentation templates, a safe installer, and self-checks.

It is not a plugin, daemon, MCP server, or custom multi-agent framework. It uses DSH's instruction loading, skill discovery, native tools, permissions, and optional subagents.

## Why this exists

Coding agents commonly fail in predictable ways: they guess project commands, skip verification, produce noisy reviews, keep planning instead of implementing, or turn project context into an unmaintainable wall of instructions. DSH Workflow addresses those failure modes with a small set of rules and procedures:

- direct implementation by default, with planning scaled to complexity and risk;
- explicit acceptance criteria and repository-discovered verification commands;
- evidence-driven review that prioritizes real defects over style;
- a bounded repair loop instead of endless review rounds;
- concise, repository-local project knowledge;
- no silent authorization and no invented capabilities.

See [docs/WORKFLOW.md](docs/WORKFLOW.md) for the execution model and [docs/DSH-CAPABILITY-MAP.md](docs/DSH-CAPABILITY-MAP.md) for the verified DSH behavior behind it.

## Verified DSH integration

The workflow targets DSH `0.2.1-rc.2`. DSH is a developer preview, so re-verify before relying on another version.

| Mechanism | Location/behavior |
| --- | --- |
| Global instructions | `$DSH_HOME/AGENTS.md`, defaulting to `~/.dsh/AGENTS.md` |
| User skills | `$DSH_HOME/skills/<name>/SKILL.md` |
| Project instructions | `AGENTS.md` from the project root down to the working directory |
| Model skill access | DSH's `skill` tool and injected skill catalog |
| Explicit user invocation | `/quick-fix`, `/spec`, `/build`, `/verify`, `/review`, `/test-design` |

The `/name` form is DSH's user-invocable skill gesture. This repository does not generate slash-command files. See the capability map for evidence and for behavior that remains runtime-unverified.

## Prerequisites

- **DSH** installed and runnable (`npx @deepseek-ai/dsh web`, or another supported profile). Verified against `0.2.1-rc.2`.
- **Node.js**, as required by your DSH installation.
- **Bash 3.2 or newer**, Git, and standard Unix tools (`cp`, `cmp`, `find`, `grep`, `sed`, `awk`, `mktemp`).
- **Linux or macOS.** Windows is not supported by the shell scripts; WSL and Git Bash are unverified.
- No project dependencies are added by the workflow.

## Installation

```sh
git clone https://github.com/imdanialrashidi/dsh-workflow.git
cd dsh-workflow
bash scripts/install.sh --dry-run
bash scripts/install.sh
```

Start a new DSH session afterward. A new session ensures the global instruction baseline is loaded and the skill catalog is current.

To use a non-default DSH home, either export the same variable DSH uses or pass the path explicitly:

```sh
DSH_HOME=/path/to/dsh-home bash scripts/install.sh
bash scripts/install.sh --dsh-home /path/to/dsh-home
```

### What installation writes

```text
$DSH_HOME/AGENTS.md
$DSH_HOME/skills/quick-fix/SKILL.md
$DSH_HOME/skills/spec/SKILL.md
$DSH_HOME/skills/build/SKILL.md
$DSH_HOME/skills/verify/SKILL.md
$DSH_HOME/skills/review/SKILL.md
$DSH_HOME/skills/test-design/SKILL.md
```

It does not modify profiles, `cordis.patch.yml`, credentials, sessions, storages, or project files. It never uses `sudo`, downloads code, or runs a network command.

### Conflicts and backups

- An identical file is left unchanged.
- A differing file is **not** overwritten by default. The installer reports the conflict and exits nonzero, after installing non-conflicting files.
- `--force` replaces a conflicting file only after creating a timestamped backup next to it, such as `SKILL.md.bak.20261025184500`.
- `--dry-run` reports planned actions and conflicts without creating or changing anything.

Review a conflict before forcing replacement. The file may contain your own global instructions or a customized skill.

## Updating

```sh
git pull --ff-only
bash scripts/install.sh --dry-run
bash scripts/install.sh
```

If a file changed upstream and locally, the default install reports a conflict and preserves your copy. Merge it manually, or use `--force` to replace it with a backup. Remove old backups manually when they are no longer useful.

## Removal

Remove only the files this workflow installed. Do not delete the whole skills directory, because it may contain your own skills.

```sh
DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
rm -f "$DSH_HOME/AGENTS.md"
for skill in quick-fix spec build verify review test-design; do
  rm -rf "$DSH_HOME/skills/$skill"
done
```

If `--force` replaced a pre-existing `AGENTS.md`, restore your backup from the same directory. Start a new DSH session after removal.

## Initialize a project

The initializer creates a short project entry point and four focused documents:

```sh
bash scripts/init-project.sh /path/to/project --dry-run
bash scripts/init-project.sh /path/to/project
```

It creates only:

```text
AGENTS.md
docs/PRODUCT.md
docs/ARCHITECTURE.md
docs/DESIGN.md
docs/QUALITY.md
```

Existing files are never overwritten, and there is no force mode. Fill the placeholders with real project information, remove sections that do not apply, and keep the files short enough that an agent can use them.

The project template's `AGENTS.md` points to the other documents; DSH automatically loads the `AGENTS.md`/`CLAUDE.md` instruction chain, not arbitrary files under `docs/`. Do not assume other documents are injected automatically.

## Usage

DSH injects the available skills into the session and uses their descriptions to decide when to load one. You can also invoke a skill explicitly:

```text
/quick-fix Fix the null check in the CSV importer.
/spec Add CSV export for the audit log, preserving existing filters.
/build Implement the accepted CSV export design.
/verify
/review
/test-design The export must handle empty results and a 50 MB stream.
```

If you prefer natural language, describe the task. The model should load the matching skill when its description applies.

| Skill | Use when | Main output |
| --- | --- | --- |
| `quick-fix` | Small, clear, low-risk fix | Change, targeted check, diff review |
| `spec` | Requirements or acceptance are unresolved | Outcome, criteria, scope, constraints, verification strategy |
| `build` | The change is ready to implement | Coherent implementation and updated tests/docs |
| `verify` | Validation is needed | Executed checks with passed/failed/blocked/unproven/unexecuted statuses |
| `review` | A diff needs defect review | Evidence-backed findings and a bounded repair loop |
| `test-design` | Coverage or failure modes need designing | Focused tests with meaningful failure detection |

A typical normal feature:

1. Define or confirm a few observable acceptance criteria.
2. Implement the smallest coherent slice.
3. Run the project's actual checks.
4. Review the diff.
5. Fix actionable findings, rerun affected checks, and re-review only the new changes.

For high-risk changes, add negative-path tests, a security review, and independent review with a fresh-context DSH subagent when available. Subagents are optional. See [docs/REVIEW-POLICY.md](docs/REVIEW-POLICY.md) and [docs/QUALITY-POLICY.md](docs/QUALITY-POLICY.md).

## Architecture

```text
README.md                     Purpose, install/update/remove, usage
AGENTS.md                     Development rules for this repository
global/AGENTS.md              Short instructions installed as $DSH_HOME/AGENTS.md
skills/                       Six runtime procedures, each with one SKILL.md
docs/WORKFLOW.md              Decision model and phase transitions
docs/DSH-CAPABILITY-MAP.md    Verified DSH capabilities and limitations
docs/QUALITY-POLICY.md        Evidence, acceptance, and test standards
docs/REVIEW-POLICY.md         Risk tiers, finding quality, repair limits
docs/SECURITY.md              Permissions, secrets, destructive actions, CI
templates/project/            Project AGENTS.md and docs scaffolds
scripts/install.sh            Idempotent, conflict-aware global installer
scripts/init-project.sh       Non-destructive project initializer
scripts/check.sh              Self-validation and isolated script tests
.github/workflows/quality.yml Minimal CI: checkout and scripts/check.sh
```

The installed footprint is intentionally limited to one global instruction file and six skill files. The repository documentation is for maintainers and users; it is not copied into every project.

## Verifying this repository

```sh
bash scripts/check.sh
```

The check validates:

- required files and document headings;
- skill frontmatter, kebab-case names, allowed keys, non-empty bodies, and one-file bundle layout;
- shell syntax and executable bits;
- cross-document skill references;
- the CI workflow's pinned checkout SHA, read-only permission, and no secrets;
- installer help, dry run, installation, idempotence, conflict handling, backups, symlink safety, path override, empty-path rejection, and root-path rejection;
- project initializer dry run, non-destructive output, repeatability, and missing-target rejection;
- that isolated test runs do not modify seeded credentials or profile files.

CI runs the same script on Ubuntu. It is intentionally minimal and uses no secrets. The check is not a substitute for project-level verification: it does not build an arbitrary repository, start DSH with a model, or exercise a project's tests. Project-level verification must discover those commands from the project itself.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Skills do not appear | Confirm `$DSH_HOME/skills/<name>/SKILL.md` exists and the frontmatter `name` matches the directory. Start a new session. A same-name project skill shadows the global one. |
| `/name` is treated as plain text | The name must be user-invocable (default) and exist in the current workspace catalog. Check the skill root and name. |
| Global instructions are not applied | Confirm the file is at `$DSH_HOME/AGENTS.md` and DSH is using the same `$DSH_HOME`. Start a new session; global instructions are not watched continuously. |
| Installer reports a conflict | Your file differs. Review it, merge manually, or use `--force` and restore from the generated backup if needed. |
| Installer refuses the target | The path is the filesystem root, empty, or not a directory. Use a real `$DSH_HOME` path. |
| Project initializer skips a file | The file already exists. It is preserved by design; merge the template manually if appropriate. |
| `bash: ...` syntax errors | The scripts require Bash 3.2 or newer. On Windows, use WSL; native Windows is unsupported. |
| `dsh: command not found` | Install Node.js and run DSH through `npx @deepseek-ai/dsh web` or your installed command. This repository does not install DSH. |
| A check is denied | DSH's approval and sandbox controls apply. Report the check as blocked; do not bypass the policy. |
| CI fails but local checks pass | Check the Bash version and working directory, and run `bash scripts/check.sh` from the repository root. Report the exact failing check. |

## Design decisions and trade-offs

- **Instructions and skills, not a plugin.** This keeps installation portable and avoids duplicating DSH's orchestration, permission, and tool layers.
- **Direct implementation by default.** Planning is optional and scaled to risk; the workflow does not require a specification for every change.
- **Evidence over claims.** Verification distinguishes passed, failed, blocked, unproven, and unexecuted checks.
- **Review is bounded.** Important findings require a concrete failure scenario; repairs are capped at two rounds and re-review is diff-only.
- **Subagents are optional.** They are used for genuinely independent work such as fresh-context review, not as a required stage.
- **No universal test runner.** The workflow discovers each project's own commands instead of imposing a language or build system.
- **Short context, linked detail.** The global file is concise; project knowledge is structured and local.

## Security

See [docs/SECURITY.md](docs/SECURITY.md). The workflow does not grant approvals, bypass sandboxes, or authorize destructive actions. DSH's own controls remain authoritative.

## Status and limitations

- Version 0.1, verified against DSH `0.2.1-rc.2` on Linux.
- DSH is a developer preview; skill paths, defaults, and tool names can change.
- The DSH instruction paths, skill format, and precedence were verified from source, official documentation, live configuration, and direct calls to the installed loader and skill-provider APIs. No isolated model session was run, so the model-facing catalog message and `/name` injection remain runtime-unverified.
- The GitHub Actions workflow was validated locally and by content checks, not by a GitHub-hosted run.
- macOS, WSL, and Windows behavior are unverified.
- The workflow improves discipline; it does not guarantee correctness, security, or review completeness.

## Research and references

- DSH repository and documentation: [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)
- Anthropic, [How the Claude Code team does code review](https://claude.dev/blog/solving-code-review-at-anthropic/)
- OpenAI, [Harness engineering](https://openai.com/index/harness-engineering/) (original returned HTTP 403 on 2026-10-25; content was read through a text mirror, as noted in the capability map)
- GitHub, [Secure use reference for GitHub Actions](https://docs.github.com/en/actions/reference/security/secure-use)
