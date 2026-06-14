# Sprint 2 - PJM Sync Foundation

## Objectif

Poser la fondation du module `pjm-sync` avec des donnees locales mockees ou seedees.

Ce sprint valide que le middleware sait lire et exposer les categories, groupes de prix, moteurs, options et choix PJM stockes en base locale, sans connecter une API PJM reelle.

## Fichiers modifies ou ajoutes

- `package.json`
- `README.md`
- `src/app.ts`
- `src/modules/pjm-sync/pjmSync.routes.ts`
- `src/modules/pjm-sync/pjmSync.controller.ts`
- `src/modules/pjm-sync/pjmSync.service.ts`
- `src/modules/pjm-sync/pjmSync.types.ts`
- `src/modules/pjm-sync/pjmSync.mockData.ts`
- `scripts/seed-pjm-mock.mjs`
- `scripts/test-sprint-2-pjm-sync-foundation.mjs`
- `scripts/dev-check.mjs`
- `docs/sprints/sprint-2-pjm-sync-foundation.md`
- `docs/architecture/pjm-sync-model.md`

## Endpoints ajoutes

- `GET /pjm-sync`
- `GET /pjm-sync/categories`
- `GET /pjm-sync/price-groups`
- `GET /pjm-sync/price-engines`
- `GET /pjm-sync/price-engines/:id/options`

## Modeles Prisma utilises

- `PjmProductCategory`
- `PjmPriceGroup`
- `PjmPriceEngine`
- `PjmOption`
- `PjmOptionChoice`

Aucun modele Prisma n'est ajoute ou modifie dans ce sprint.

## Tests automatises

```bash
npm run test:sprint2
npm run dev:check
```

`dev-check` execute maintenant automatiquement tous les scripts `scripts/test-sprint-*.mjs` dans l'ordre.

## Resultat attendu

Le module `pjm-sync` expose une lecture structuree des donnees PJM locales. Les donnees peuvent etre alimentees par le seed mock :

```bash
npm run seed:pjm-mock
```

Le sprint ne cree pas de connecteur PJM reel, ne cree pas d'import/export Excel, et ne modifie pas la logique V22.1.
