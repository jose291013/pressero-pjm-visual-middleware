# PJM Sync Model

The `pjm-sync` module owns local storage of PJM product categories, price groups, price engines, options and option choices.

Sprint 1 does not connect to the PJM API. It only defines module boundaries and Prisma models so later sprints can add mocked or seeded synchronization first, then a real connector once the structure is stable.

Sprint 2 adds the first read-only foundation:

- a mock PJM dataset for development;
- an idempotent seed script based on Prisma `upsert`;
- read endpoints for categories, price groups, price engines and engine options;
- no real PJM API connector.

The service reads from the local database only. This keeps the future connector isolated from controllers and Pressero-facing configuration generation.
