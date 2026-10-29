# DSH capability map

Research date: 2026-10-25. Verified against the installed `@deepseek-ai/dsh` **0.2.1-rc.2** and the official repository at commit [`22ddee3`](https://github.com/deepseek-ai/deepseek-harness/commit/22ddee3792402c3e70ec5f86a63c3e3e895a2f60) (2026-10-23). DSH is a developer preview; re-verify before claiming support for another version.

Status meanings:

- **Confirmed** — verified in installed package source/docs, official documentation, live runtime configuration, or a direct call to the installed package API. This does not imply an end-to-end model test.
- **Unverified** — supported by documentation or static inspection but not exercised in a running session.
- **Unavailable** — not present in the default installation or not reachable from the current session.

## Capabilities

| Capability | Verified behavior and evidence | Design implication | Status |
| --- | --- | --- | --- |
| DSH home resolution | `$DSH_HOME`, else `~/.dsh`; `$DSH_AGENTS_HOME`, else `~/.agents`. Blank environment values are ignored. [home-paths README](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/util/home-paths/README.md) | Resolve the installer target the same way; allow an explicit `--dsh-home` for isolated tests. Never touch credentials, profiles, sessions, or storages. | Confirmed, source and docs |
| User-global instructions | `$DSH_HOME/AGENTS.md`, then `$DSH_AGENTS_HOME/AGENTS.md`. Both are injected as a bounded baseline. [agent-instructions README](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/context/agent-instructions/README.md) | Install the workflow's global instructions at `$DSH_HOME/AGENTS.md`. Keep them short. | Confirmed, DSH loader; session injection unverified |
| Project instructions | Nearest ancestor containing `.git`; every existing `AGENTS.md`/`CLAUDE.md` from project root to cwd, broad to specific; `AGENTS.local.md`/`CLAUDE.local.md` overlays; nested files discovered after a successful first-party `read`/`write`/`edit` reaches a deeper directory. Duplicate content is collapsed; changes/removals are announced. [README](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/context/agent-instructions/README.md) | The root project template is enough as an entry point; no need to create `CLAUDE.md` or copy global rules into every directory. Update nested instructions only when a subtree needs different rules. | Confirmed, DSH loader; session injection unverified |
| Instruction budget | Configured `maxBytes` is 65,536 in the Web profile's `agent-instructions` row. In 0.2.1-rc.2, the user-global and project chains are budgeted separately (at most twice the value in one baseline). Broader files are omitted before the most-specific file is truncated. [config.ts](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/context/agent-instructions/src/config.ts) | Keep global instructions under a few kilobytes. Do not treat the budget as permission to write a giant file. | Confirmed, runtime config dump and source |
| Skill roots and precedence | Rank 100 `<project>/.dsh/skills`, 200 `<project>/.agents/skills`, 300 custom dirs, 400 `$DSH_HOME/skills`, 500 `$DSH_AGENTS_HOME/skills`. Project root is the nearest `.git` ancestor. [skill-filesystem README](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/skill/skill-filesystem/README.md) | Install user skills at `$DSH_HOME/skills/<name>/SKILL.md`. A same-name project skill shadows the global one. | Confirmed, source and live config |
| Skill format | Directory bundle `<name>/SKILL.md` or flat `<name>.md`; only one directory level deep. YAML frontmatter requires `name` and `description`; optional `whenToUse`, `metadata`, `disable-model-invocation`, `user-invocable`. Name must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Every load re-reads the body. [skills subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/skills.md) | Six skill directories with one `SKILL.md` each. Keep bodies self-contained because only the skill file is installed. | Confirmed, DSH parser |
| Skill invocation | DSH injects a model-facing catalog and exposes the `skill` tool. A whitespace-bounded `/name` token in direct user input invokes a user-invocable skill. These are not generated slash-command files. [tool-skill README](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/skill/tool-skill/README.md) | Document `/quick-fix`, `/spec`, etc. as skill names. Rely on the catalog and tool; do not ship command files. | Confirmed, docs and source; model session unverified |
| Skill reload | Chokidar watches existing roots; first-party `write`/`edit` invalidates synchronously. New, renamed, and deleted skills reach the next catalog without restart. Global instructions are not continuously watched; resume reconciles the baseline. | A new session is the safe default after installation. Skill file edits can appear without restart. | Confirmed, source; live reload unverified |
| Native tools | The current session exposes filesystem, shell, search, web, todo, goal, schedule, presentation, skill, and subagent tools. The exact set is composition-dependent. [tool catalog](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/tool-catalog.md) | Use native tools. Do not add MCP servers or plugins for functionality already available. | Confirmed, live session and docs |
| Subagents | `subagent` starts a fresh in-process child that does not see the parent conversation; `subagent_fork` seeds a child from completed history. Starts are asynchronous and return a child id; completion arrives as a notice. Default delegation depth is 1. [tool-subagent README](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/subagent/tool-subagent/README.md) | Use `subagent` for fresh-context review, only when independent work adds value. Never require subagents for every task. | Confirmed, live session and docs |
| Permissions | Approval policies `ask` and `never`; `ask` fails closed when no answerer exists, while `never` rejects approval-requiring actions deterministically. Sandbox modes `read-only`, `workspace-write`, `danger-full-access`; default presets pair `workspace-write`+`ask` and `danger-full-access`+`never`. [approval](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/approval.md), [sandbox](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/sandbox.md), [presets](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/permission-presets.md) | Never claim approval or add instructions that bypass it. Report denied work as blocked. Prefer the narrowest sandbox. | Confirmed, docs and runtime policy |
| Configuration and profiles | Profiles live at `$DSH_HOME/profiles/<name>` with `cordis.patch.yml` and a package manifest; user patches also exist at `$DSH_HOME/cordis.patch.yml`. Profiles are composed bundles. [CLI README](https://github.com/deepseek-ai/deepseek-harness/blob/master/apps/cli/README.md) | The installer must not modify profiles or `cordis.patch.yml`. Installation is file-based, not plugin-based. | Confirmed, docs and filesystem |
| Browser automation | Human sidebar browser is a client UI feature (disabled by default in Web). Optional experimental browser-use providers (Playwright MCP, Chrome DevTools MCP, Stagehand) exist upstream, but are not installed or enabled in this environment and expose no browser tool in the current session. [browser-use subsystem](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/browser-use.md), [sidebar browser README](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-sidebar-browser/README.md) | Do not require browser verification. Run the project's own browser tests when they exist and the tool is available; otherwise mark the check unexecuted. | Unavailable by default; upstream optional |
| Review reference | Anthropic's code-review article describes layered checks, verified findings, risk-tiered human review, noise measurement, diff-only re-review, and a round cap. [Article](https://claude.dev/blog/solving-code-review-at-anthropic/) | Require evidence, validate important findings, cap repairs at two rounds, and re-review only new changes. | Confirmed, source article |
| Harness engineering reference | OpenAI's article describes a short `AGENTS.md` as a map, structured repository docs, mechanical checks, feedback loops, and invariant enforcement. The original URL returned HTTP 403; content was retrieved through a text mirror on the same date. [Article](https://openai.com/index/harness-engineering/) | Keep the global file short, use a small project docs set, discover real commands, and prefer enforceable checks over prose. | Secondary retrieval; treat claims with caution |
| GitHub Actions | GitHub recommends full-length commit SHAs for third-party actions and least-privilege workflow permissions. [Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use) | Pin checkout to an immutable SHA, grant only `contents: read`, and run no secrets. | Confirmed, official docs; CI not executed here |

## Runtime observations

Collected locally on 2026-10-25 without model calls:

```text
npx @deepseek-ai/dsh --version
0.2.1-rc.2

npx @deepseek-ai/dsh --profile web --dump-config
- id: agent-instructions
  config:
    maxBytes: 65536
- name: '@deepseek-ai/dsh-skill'
- id: skill-filesystem
- id: tool-skill
```

The live session exposed the `skill`, `subagent`, and `subagent_fork` tools, and no browser tool.

### Direct package-API checks

These checks exercised the installed DSH package code directly, without a model or a network request:

- Installed the six skills into a temporary `$DSH_HOME`, constructed the exported `FileSystemSkillProvider` with `watch: false`, and loaded every skill. All six parsed as `user-dsh` at rank 400 with their description, `whenToUse`, instruction body, and a directory resource base. This confirms the installed directory layout and frontmatter against the real provider.
- Built a temporary `$DSH_HOME`, `$DSH_AGENTS_HOME`, project root, nested directory, and local overlay, then called the exported `loadBaselineInstructions` with `maxBytes: 65536`. The rendered baseline contained `$DSH_HOME/AGENTS.md`, `$DSH_AGENTS_HOME/AGENTS.md`, `AGENTS.md`, `sub/AGENTS.md`, and `sub/AGENTS.local.md`, in broad-to-specific order. This confirms the paths and precedence used by the installer and project template.

These are package-API checks, not a model-session test. The model-facing catalog message and `/name` gesture were not observed end to end.

## Research limitations

- No isolated DSH model session was started to observe the injected instruction text, the model-facing skill catalog, or `/name` skill injection. Those integration points remain **runtime-unverified**. The paths, formats, and precedence were verified against source, official documentation, the live configuration, and direct calls to the installed provider and loader APIs.
- The OpenAI article's canonical URL returned HTTP 403. The text used for this research came from `https://r.jina.ai/https://openai.com/index/harness-engineering/`, a third-party text mirror. No claim in this repository depends on an unverified detail from it.
- The GitHub Actions workflow was validated by repository checks and YAML review, not by a GitHub-hosted run.
- Only Linux was tested. macOS Bash behavior and Windows are not verified.
- DSH's developer-preview status means paths, defaults, and tool names can change. The capability map must be updated with evidence when they do.
- OMP conventions, Claude Code slash-command files, and other harness-specific mechanisms were not assumed or tested. The only invocation mechanisms documented here are DSH's skill catalog, `skill` tool, and `/name` user gesture.
