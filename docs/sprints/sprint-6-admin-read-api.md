# Sprint 6 - Admin Read API

## Objectif

Preparer l'API backend de lecture pour le futur backoffice.

Ce sprint expose les donnees PJM synchronisees sans creer encore d'interface graphique et sans lancer de nouvelle synchronisation.

## Fichiers modifies ou ajoutes

- `package.json`
- `README.md`
- `src/modules/pjm-sync/pjmSyncAdmin.service.ts`
- `src/modules/pjm-sync/pjmSync.controller.ts`
- `src/modules/pjm-sync/pjmSync.routes.ts`
- `src/modules/pjm-sync/pjmSync.types.ts`
- `docs/architecture/admin-api.md`
- `docs/sprints/sprint-6-admin-read-api.md`
- `scripts/test-sprint-6-admin-read-api.mjs`

## Endpoints ajoutes

- `GET /pjm-sync/admin/summary`
- `GET /pjm-sync/admin/price-engines`
- `GET /pjm-sync/admin/price-engines/:id`
- `GET /pjm-sync/admin/price-engines/:id/mappings`
- `GET /pjm-sync/admin/price-engines/:id/options`

## Modeles Prisma utilises

- `PjmPriceEngine`
- `PjmPriceGroup`
- `PjmEnginePriceGroupMapping`
- `PjmOption`
- `PjmOptionChoice`
- `PjmProductCategory`

Aucun modele Prisma n'est ajoute ou modifie dans ce sprint.

## Tests automatises

```bash
npm run test:sprint6
npm run dev:check
```

Le test verifie les routes admin, le service de lecture, la documentation et l'absence de lancement automatique d'une synchro PJM.

## Resultat attendu

Le backoffice pourra commencer au sprint suivant avec une API stable pour afficher moteurs, mappings, options et choix.
