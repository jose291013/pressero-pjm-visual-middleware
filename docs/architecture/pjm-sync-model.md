# PJM Sync Model

The `pjm-sync` module owns local storage of PJM product categories, price groups, price engines, options and option choices.

Sprint 1 does not connect to the PJM API. It only defines module boundaries and Prisma models so later sprints can add mocked or seeded synchronization first, then a real connector once the structure is stable.

Sprint 2 adds the first read-only foundation:

- a mock PJM dataset for development;
- an idempotent seed script based on Prisma `upsert`;
- read endpoints for categories, price groups, price engines and engine options;
- no real PJM API connector.

The service reads from the local database only. This keeps the future connector isolated from controllers and Pressero-facing configuration generation.

Sprint 3 corrects the model for real PJM product engine responses:

- a PJM product engine can have multiple price groups;
- each pair is identified by `EnginePriceGroupIntegrationId`;
- those pairs are stored as `PjmEnginePriceGroupMapping`;
- `PjmPriceEngine` no longer owns a single `priceGroupId`.

The next connector sprint should map `productEngines/list` responses into:

- `PjmPriceEngine.pjmId` from `Id`;
- `PjmPriceEngine.name` from `Name`;
- `PjmPriceGroup.name` from `PriceGroupName`;
- `PjmEnginePriceGroupMapping.enginePriceGroupIntegrationId` from `EnginePriceGroupIntegrationId`.

Sprint 4 adds the client boundary but still does not run a sync automatically.

The `PjmClient` is a low-level integration object. Services that persist data should call it later from explicit sync scripts or endpoints, then write normalized data through Prisma.
