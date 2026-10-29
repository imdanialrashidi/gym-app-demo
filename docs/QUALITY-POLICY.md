# Quality policy

Quality means the change does what was agreed, under the conditions that matter, and the evidence is inspectable. Confidence, effort, or a clean-looking diff is not evidence.

This document owns the evidence standard. The installed [verify skill](../skills/verify/SKILL.md) restates the result categories and report shape because installed skills must be self-contained; the skill owns the execution procedure, not a second policy.

## Acceptance criteria

Acceptance criteria are part of the change, not an optional introduction. They must be:

- **Observable** — stated as an outcome someone can verify, not as an implementation task.
- **Testable** — mapped to a check or a clearly described manual/runtime observation.
- **Bounded** — specific enough to exclude unrelated work.
- **Failure-aware** — include the denied, invalid, empty, cancelled, or rollback case when those paths matter.

For a small fix, one sentence of expected behavior is enough. For a normal feature, use a short list. For a complex or high-risk change, include constraints and negative paths. Planning effort scales with risk; acceptance criteria do not disappear.

## Evidence standard

Every completed check records:

- the exact command or operation;
- the working directory;
- the exit code;
- the output that supports the conclusion, trimmed to what is relevant.

For a runtime or manual check, record what was started, what was observed, and what could not be observed. "Looks correct" is not evidence.

### Result categories

| Status | Meaning |
| --- | --- |
| passed | The check executed and succeeded. |
| failed | The check executed and failed. |
| blocked | A missing tool, service, credential, platform, or permission prevented execution. Name the blocker. |
| unproven | A claim rests on inspection or reasoning rather than execution. |
| unexecuted | A check was available or planned but did not run, was skipped, or was cancelled. |

A skipped test is unexecuted, not passed. A test suite that was never discovered is not a pass. A failure in an unrelated check is still a failure to report until it is shown to be pre-existing and irrelevant.

## Verification selection

Use the project's actual commands. Read its `AGENTS.md`, README, contributor guide, CI workflow, task runner, and manifests. Do not impose a language, package manager, or test layout.

Select checks by the changed surface and the risk:

- changed local behavior → focused unit or integration test;
- changed interface or schema → contract or compatibility test;
- changed data path → migration, rollback, and integrity checks;
- changed security boundary → denial, authorization, and secret-handling checks;
- changed build or release path → build and packaging checks;
- UI or runtime behavior → start the application and observe it, when the project supports that.

Broad suites are useful after focused checks pass, but a broad green run does not excuse an untested acceptance criterion.

## Missing prerequisites

When a required tool or service is absent:

1. Report the check as **blocked**, with the missing prerequisite.
2. Do not install a new toolchain or dependency into the project just to make a check appear to run, unless the user asked for that change.
3. If the project defines a supported container or bootstrap path, use it only when it does not modify unrelated configuration.
4. Continue with the checks that can run and state what remains unverified.

## Test quality

A worthwhile test detects a realistic incorrect behavior. It is not valuable because it increases a coverage number, mirrors the implementation, or repeats an assertion already covered at another layer.

- Prefer observable outcomes over private internals.
- Include boundary and negative cases for changed contracts.
- Mock only external, slow, nondeterministic, or unsafe dependencies, and verify the interaction that matters.
- Keep tests deterministic and isolated; control time, ordering, randomness, and shared state.
- Do not weaken an assertion, skip a test, widen an ignore rule, or delete coverage to obtain a green result.
- A test that cannot fail against a plausible wrong implementation is not evidence.

Use [the test-design skill](../skills/test-design/SKILL.md) for the detailed procedure.

## Review and completion

Verification and review are different activities. Verification executes checks; review reasons about the diff and its context. Passing checks do not imply a correct design, and a clean review does not replace execution.

A change is complete when:

- acceptance criteria are met or explicitly reported as unmet;
- every planned check has a status and the evidence is available;
- actionable review findings are fixed, or accepted with a recorded owner and reason;
- documentation owned by the change is current;
- residual risks and unexecuted checks are reported.

Do not describe incomplete work as complete, and do not use "should work", "likely fixed", or "tests pass" without the command and result.

## Anti-patterns

- Inventing a command and reporting its absence as success.
- Treating a missing tool as a pass.
- Re-running a flaky test until it passes without investigating the flake.
- Weakening a test to match a bug.
- Reporting a manual inspection as runtime verification.
- Adding broad mocks that remove the boundary under test.
- Listing only passing checks and omitting failures or blocked work.
- Calling a change done while a review finding remains unresolved.

## Roles

- The **writer** implements the change, runs focused checks, inspects the diff, and fixes findings.
- The **verifier** discovers and executes checks, records evidence, and does not modify source while verifying.
- The **reviewer** finds defects and validates claims; the reviewer does not edit during the review phase.
- The **user or owner** decides product direction and explicitly accepts residual risk. A workflow cannot accept risk on the user's behalf.
