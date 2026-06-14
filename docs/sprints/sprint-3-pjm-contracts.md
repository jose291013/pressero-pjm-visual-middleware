# Sprint 3 - PJM Contracts

## Objectif

Documenter les contrats PJM reels et corriger le modele local avant de creer un connecteur reseau.

Ce sprint ne lance aucun appel PJM. Il fige les formes attendues pour l'authentification, la liste moteurs/groupes, les options moteur et options/prix.

## Fichiers modifies ou ajoutes

- `.gitignore`
- `.env.example`
- `package.json`
- `prisma/schema.prisma`
- `src/modules/pjm-sync/pjmContracts.types.ts`
- `src/modules/pjm-sync/pjmSync.types.ts`
- `src/modules/pjm-sync/pjmSync.mockData.ts`
- `src/modules/pjm-sync/pjmSync.service.ts`
- `scripts/seed-pjm-mock.mjs`
- `scripts/test-sprint-3-pjm-contracts.mjs`
- `docs/architecture/pjm-endpoints.md`
- `docs/architecture/pjm-sync-model.md`
- `docs/sprints/sprint-3-pjm-contracts.md`

## Endpoints ajoutes

Aucun endpoint interne n'est ajoute dans ce sprint.

## Modeles Prisma ajoutes ou modifies

Ajout :

- `PjmEnginePriceGroupMapping`

Modification :

- `PjmPriceEngine` ne pointe plus vers un seul `PjmPriceGroup`.
- `PjmPriceGroup` expose ses mappings via `engineMappings`.

## Tests automatises

```bash
npm run test:sprint3
npm run dev:check
```

Le test verifie le nouveau modele Prisma, les types de contrats PJM, la documentation endpoint, le seed mock et la non-version du zip de reference.

## Resultat attendu

Le projet represente correctement le fait qu'un moteur PJM peut avoir plusieurs groupes de prix via `EnginePriceGroupIntegrationId`.

Le prochain sprint pourra creer un client PJM isole sans devoir changer la base du modele.
