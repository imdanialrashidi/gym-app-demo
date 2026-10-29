# Design

Own interfaces and behavior. Use this for decisions that a future change must respect; do not use it as a scratchpad.

## Scope

<What interface or behavior does this document cover? What is out of scope?>

## Contracts

| Contract | Inputs | Outputs | Errors | Compatibility |
| --- | --- | --- | --- | --- |
| <name> | <shape> | <shape> | <failure semantics> | <versioning rule> |

## States and transitions

<List the meaningful states and the events that move between them. Include empty, loading, error, denied, cancelled, and partial-success states where they exist.>

## Error behavior

- Validation failure: `<message and recovery>`
- Permission or authorization failure: `<message and recovery>`
- Dependency failure: `<retry, timeout, fallback>`
- Partial completion: `<what is retained, what is rolled back>`

## User experience

<For UI changes: layout, interaction, accessibility, responsive behavior, and the failure states. Link screenshots or prototypes only if they are versioned with the repository.>

## Security and privacy

<Trust boundaries, authorization checks, sensitive data, logging/redaction, and destructive actions.>

## Compatibility and migration

<Versioning, deprecation, data migration, rollout, and rollback.>

## Decisions

| Decision | Alternatives considered | Rationale | Date |
| --- | --- | --- | --- |
| <choice> | <alternatives> | <why> | <date> |

## Related documents

- Product: [PRODUCT.md](PRODUCT.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- Verification: [QUALITY.md](QUALITY.md)
