# Pressero PJM Visual Middleware

Foundation for a middleware between Pressero and PrintJobManager/PJM.

The key rule from the validated V22.1 reference is preserved:

```text
Visual interface
-> real Pressero/PJM fields
-> native PJM recalculation
-> native price
-> native cart
```

Sprint 1 only creates the project foundation: Express, `GET /health`, Prisma schema, modular source layout, and validation scripts. It does not connect to PJM, does not implement Excel import/export, and does not alter the V22.1 reference script.

## Scripts

```bash
npm run dev
npm run build
npm run test:sprint1
npm run test:sprint2
npm run dev:check
```

Install dependencies before running the TypeScript server:

```bash
npm install
npm run prisma:generate
```

## Sprint 2 mock PJM data

Sprint 2 adds read-only `pjm-sync` endpoints backed by local Prisma data:

```text
GET /pjm-sync/categories
GET /pjm-sync/price-groups
GET /pjm-sync/price-engines
GET /pjm-sync/price-engines/:id/options
```

Load the development mock dataset after configuring PostgreSQL:

```bash
npm run seed:pjm-mock
```

Run the real PJM catalog sync only when PJM credentials are configured:

```bash
npm run sync:pjm
```

The same sync can be launched from the backoffice:

```text
POST /pjm-sync/admin/sync
```

Backoffice-ready read endpoints are available under:

```text
GET /pjm-sync/admin/summary
GET /pjm-sync/admin/price-engines
GET /pjm-sync/admin/price-engines/:id
GET /pjm-sync/admin/price-engines/:id/mappings
GET /pjm-sync/admin/price-engines/:id/options
```

Open the first backoffice screen:

```text
http://localhost:3000/admin
```
