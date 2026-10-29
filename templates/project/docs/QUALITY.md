# Quality

Own commands, test strategy, and the definition of done. Keep commands current; a stale command is worse than a missing one.

## Commands

| Purpose | Command | Expected result |
| --- | --- | --- |
| Focused test | `<command>` | `<pass condition>` |
| Full test suite | `<command>` | `<pass condition>` |
| Type check | `<command>` | `<pass condition>` |
| Lint/format check | `<command>` | `<pass condition>` |
| Build | `<command>` | `<pass condition>` |
| Runtime smoke test | `<command>` | `<what to observe>` |

If a command is unavailable in an environment, report the check as blocked with the missing prerequisite. Do not replace it with an invented command.

## Test layers

| Layer | Scope | Where | When to run |
| --- | --- | --- | --- |
| Unit | <isolated behavior> | `<path>` | Changed logic |
| Integration | <boundary or dependency> | `<path>` | Changed contract |
| End-to-end | <user or system flow> | `<path>` | High-risk or cross-cutting change |
| Manual/runtime | <observable behavior> | `<procedure>` | Behavior not covered above |

## Risk areas

- `<area>`: `<why it is risky and what evidence is required>`
- `<area>`: `<why it is risky and what evidence is required>`

## Test conventions

- <Naming, fixtures, factories, timeouts, isolation rules.>
- <What may be mocked and what must remain real.>
- <How flaky tests are investigated and quarantined.>

## CI

<Workflow file, required jobs, supported platforms, and what CI does not cover. Link the workflow.>

## Manual checks

- <Check requiring a real environment, device, or browser.>
- <Check requiring credentials or a service that CI cannot provide.>

## Definition of done

- Acceptance criteria are met or explicitly reported as unmet.
- Focused checks pass; broader checks have a recorded status.
- Failures, blockers, unproven claims, and unexecuted checks are reported.
- Review findings are resolved or explicitly accepted with an owner and reason.
- Documentation owned by the change is updated.

## Related documents

- Product: [PRODUCT.md](PRODUCT.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- Design: [DESIGN.md](DESIGN.md)
