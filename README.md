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
npm run dev:check
```

Install dependencies before running the TypeScript server:

```bash
npm install
npm run prisma:generate
```
