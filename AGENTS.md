# dsh-workflow repository instructions

This repository is a DSH instruction and skill pack. It is not a plugin, daemon, MCP server, or verification framework. Read [README.md](README.md) and [docs/WORKFLOW.md](docs/WORKFLOW.md) before changing behavior.

## Sources of truth

| Area | Owner |
| --- | --- |
| Purpose, installation, usage, troubleshooting | [README.md](README.md) |
| Execution model and skill selection | [docs/WORKFLOW.md](docs/WORKFLOW.md) |
| Verified DSH behavior and limitations | [docs/DSH-CAPABILITY-MAP.md](docs/DSH-CAPABILITY-MAP.md) |
| Evidence and test standards | [docs/QUALITY-POLICY.md](docs/QUALITY-POLICY.md) |
| Review rules and repair limits | [docs/REVIEW-POLICY.md](docs/REVIEW-POLICY.md) |
| Workflow security boundaries | [docs/SECURITY.md](docs/SECURITY.md) |
| Agent behavior for this repo | this file |
| Global installed instructions | [global/AGENTS.md](global/AGENTS.md) |
| Runtime procedures | `skills/*/SKILL.md` |
| Project scaffolding | `templates/project/` |
| Installer and checks | `scripts/` |

## Change rules

- Keep `global/AGENTS.md` short. Detailed procedure belongs in a skill; rationale and standards belong in `docs/`.
- Give each rule one home. Link to it instead of restating it across `AGENTS.md`, skills, and policy documents.
- A skill must be one directory with one `SKILL.md` at `skills/<kebab-case-name>/SKILL.md`. Frontmatter requires `name` and `description`; keep the body actionable and self-contained because installation copies only the skill file.
- Do not add slash-command files, OMP conventions, plugins, MCP servers, telemetry, or speculative orchestration. DSH already provides skill discovery and invocation.
- Do not add dependencies unless they solve a demonstrated requirement. The installer and checks must run with Bash, Git, and standard Unix tools.
- Keep all repository documentation and skill instructions in English.
- Do not commit, push, publish, or open a pull request unless the user explicitly asks.
- Preserve unrelated user changes.

## Commands

```sh
bash scripts/check.sh
```

The check validates required files, skill frontmatter and layout, shell syntax, documentation consistency, the CI workflow's pinned action and permissions, and installer/initializer behavior in isolated temporary homes. It must never modify the real `$DSH_HOME` or a real project.

To test manually, use a temporary directory and explicit paths. An exported `DSH_HOME` overrides `HOME`, so set it explicitly or unset it; never run an installer test without a temporary `DSH_HOME`.

```sh
tmp="$(mktemp -d)"
mkdir -p "$tmp/home" "$tmp/project"
env -u DSH_HOME HOME="$tmp/home" DSH_HOME="$tmp/dsh" bash scripts/install.sh --dry-run
env -u DSH_HOME HOME="$tmp/home" DSH_HOME="$tmp/dsh" bash scripts/install.sh
bash scripts/init-project.sh "$tmp/project"
```

## Compatibility

- Verified against DSH `0.2.1-rc.2`. DSH is a developer preview, so re-check instructions and skill discovery before claiming support for another version.
- When a DSH capability or path changes, update [docs/DSH-CAPABILITY-MAP.md](docs/DSH-CAPABILITY-MAP.md) with evidence and a confidence status. Do not document an unverified feature as supported.
- Keep GitHub Actions pinned to full commit SHAs and least-privilege permissions.
