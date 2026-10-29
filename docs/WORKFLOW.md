# Workflow

DSH Workflow is a small instruction and skill pack for coding work in DeepSeek Harness. It keeps direct implementation as the default and adds structure only where risk or uncertainty justifies it.

## Principles

1. **One primary writer.** A change has one writer responsible for the working tree. Delegated agents are for independent work such as review or investigation, not parallel edits to the same files.
2. **Plan only as much as needed.** Planning is a tool for complexity and risk, not a mandatory stage.
3. **Small, coherent changes.** Tie every change to explicit acceptance criteria and keep unrelated refactors out.
4. **Evidence over confidence.** Completion depends on executed checks and inspectable output, not a plausible narrative.
5. **Independent review where it adds value.** Review is risk-based and evidence-driven, not a ceremony.
6. **Repository-local context.** Instructions and project knowledge live with the code, stay concise, and have one owner per fact.
7. **Native DSH first.** Use DSH's instruction loading, skills, tools, permissions, and optional subagents. Do not build parallel orchestration.
8. **No silent authorization.** Workflow text never grants permission, bypasses an approval policy, or makes a sensitive action look routine.
9. **Repository independence.** The workflow does not assume a language, framework, package manager, or build system.

## Decision model

| Situation | Path | Required evidence | Independent review |
| --- | --- | --- | --- |
| Small, clear, low risk | Inspect → implement → targeted verification → diff review | A real check for the changed behavior and the inspected diff | Not required |
| Normal feature | Brief acceptance criteria → implement → verify → review | Criteria mapped to checks; diff self-review | Optional |
| Complex change | Inspect dependencies and architecture → concise plan → implement in bounded steps → verify each stage → review | Staged evidence; integration or contract checks where relevant | Recommended |
| High-risk change | Spec → implement with negative-path tests → verify → security review → independent review | Negative paths, failure/rollback evidence, security review | Required when a reviewer is available |
| Existing change review | Inspect the actual diff and context → review only | Findings with scenarios; no edits during review | Optional second reviewer |

Risk is set by the change, not by the author's confidence. A small diff in authentication, billing, migrations, CI, installers, or data deletion is still high risk.

### Small and low risk

Use `quick-fix`. Locate the cause, make the smallest fix, run the narrowest real check, and inspect the diff. Do not create a specification or plan for a one-line correction.

### Normal feature

Use `spec` only when the request leaves a real decision open. Otherwise state acceptance criteria in the response or task, then use `build`, `verify`, and `review`. The criteria need not be a separate file.

### Complex change

Inspect the relevant architecture, dependencies, and callers before editing. Write a concise plan with bounded steps and a verification point for each step. Use `build`; verify each meaningful stage instead of waiting until the end. Keep the plan in the conversation unless the repository already treats plans as artifacts; do not add process files speculatively.

### High risk

High risk includes authentication or authorization, secrets, payments, personal data, destructive operations, migrations, public API or schema changes, concurrency, dependency/runtime upgrades, CI or release automation, installers, and sandbox or approval behavior.

For these changes:

- state the threat or failure being prevented;
- test the denied, invalid, cancelled, and rollback paths, not only the happy path;
- perform a security-focused review using `review`;
- obtain independent review with a fresh-context subagent when available; otherwise report it as unexecuted;
- record accepted risks and their owners explicitly.

## Verification and statuses

`verify` discovers and runs the project's actual commands. Every check is reported as passed, failed, blocked, unproven, or unexecuted. The definitions and evidence requirements live in [QUALITY-POLICY.md](QUALITY-POLICY.md); the execution procedure is in [the verify skill](../skills/verify/SKILL.md). The final report must not collapse these categories into "done".

## Review and repair

Review looks for actionable defects with a concrete failure scenario and location. It is not a style pass. For risky changes, use a fresh-context DSH subagent for independent review and, where warranted, a separate validation pass for blocker or major findings. The finding standard and the bounded repair loop are in [REVIEW-POLICY.md](REVIEW-POLICY.md) and [the review skill](../skills/review/SKILL.md). Repair is capped at two rounds; if unresolved findings remain, stop and reassess. Never weaken tests or suppress a valid finding to get a clean report.

## Context and project knowledge

A short entry point plus focused documents beats a giant instruction file. The project template uses this structure:

| Document | Owns |
| --- | --- |
| `AGENTS.md` | Standing instructions, commands, boundaries, and links to deeper documents |
| `docs/PRODUCT.md` | Problem, users, outcomes, non-goals, and success signals |
| `docs/ARCHITECTURE.md` | System map, components, boundaries, invariants, and failure modes |
| `docs/DESIGN.md` | Interfaces, states, error behavior, compatibility, and design decisions |
| `docs/QUALITY.md` | Verification commands, test layers, risk areas, and definition of done |

Update the owning document in the same change when behavior, contracts, commands, or architecture change. Keep the entry point short and link to detail instead of duplicating it. Delete stale sections rather than letting them mislead the next agent.

## Skill usage in DSH

DSH discovers skills from the project and user skill roots, injects a catalog into the session, and lets the model load a skill with the `skill` tool. A user can also invoke a user-invocable skill with a `/name` token in direct input, for example `/spec` or `/review`. These names are not generated slash-command files; they are DSH skill names.

Load only the skill that matches the current phase. Loading every skill wastes context and encourages procedural theater. Use `test-design` when coverage or failure modes need deliberate design. If no skill is available in a project, follow the same phases manually.

Subagents are optional. Use one when the work is genuinely independent, such as a fresh-context review or a parallel investigation. Do not use subagents to satisfy a process requirement.

## Workflow completion

A change is ready to report when:

- every acceptance criterion is met or explicitly reported as unmet;
- the actual checks have been run and their statuses are recorded;
- the diff has been reviewed and actionable findings are resolved or explicitly accepted;
- documentation owned by the change is updated;
- no known blocker is hidden behind a success summary.
