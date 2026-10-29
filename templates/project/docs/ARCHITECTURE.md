# Architecture

Describe the system as it is, not as it was planned. Keep this document to a map that helps an agent find the right code and understand the boundaries.

## System overview

<One paragraph and a small diagram if useful. Name the runtime, major processes, and external systems.>

## Components

| Component | Responsibility | Location | Owner |
| --- | --- | --- | --- |
| <name> | <one sentence> | <path> | <team or person> |

## Data flow

<Trace the important paths: request to response, ingestion to storage, UI to API, job to side effect. Name the trust boundaries.>

## Boundaries and dependencies

- Allowed dependency direction: `<rule>`
- Forbidden dependencies: `<rule>`
- External services: `<service, protocol, failure behavior>`
- Data stores: `<store, ownership, migration path>`

If the repository enforces these rules mechanically, link the check or configuration.

## Invariants

State properties that must remain true. Include the failure that would result if broken.

- <Invariant and consequence>
- <Invariant and consequence>

## Failure modes

| Failure | Detection | User impact | Recovery |
| --- | --- | --- | --- |
| <failure> | <log, metric, test> | <impact> | <retry, rollback, manual> |

## Where to make changes

- New behavior in `<area>`: start at `<path>` and follow `<interface>`.
- New dependency: requires `<decision and approval>`.
- Schema or migration: read `<owning procedure>` and update `<consumers>`.
- Generated code: edit `<source>` and regenerate with `<command>`.

## Known debt and constraints

<Current limitations, fragile areas, and planned replacements. Link to the owning issue or design document instead of duplicating it.>

## Related documents

- Product: [PRODUCT.md](PRODUCT.md)
- Interfaces: [DESIGN.md](DESIGN.md)
- Verification: [QUALITY.md](QUALITY.md)
