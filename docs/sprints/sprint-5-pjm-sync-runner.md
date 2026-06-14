# Sprint 5 - PJM Sync Runner

## Objectif

Creer la premiere synchronisation PJM locale explicite.

Le sprint utilise le client PJM du Sprint 4 pour remplir la base avec :

- moteurs PJM ;
- groupes de prix generes a partir des noms PJM ;
- mappings moteur/groupe via `EnginePriceGroupIntegrationId` ;
- options ;
- choix d'options.

## Fichiers modifies ou ajoutes

- `package.json`
- `README.md`
- `src/modules/pjm-sync/pjmSyncCatalog.service.ts`
- `src/modules/pjm-sync/pjmSync.runner.ts`
- `src/modules/pjm-sync/pjmSync.types.ts`
- `docs/architecture/pjm-endpoints.md`
- `docs/architecture/pjm-sync-model.md`
- `docs/sprints/sprint-5-pjm-sync-runner.md`
- `scripts/test-sprint-5-pjm-sync-runner.mjs`

## Endpoints ajoutes

Aucun endpoint HTTP n'est ajoute.

La synchronisation est lancee volontairement avec :

```bash
npm run sync:pjm
```

## Modeles Prisma utilises

- `PjmPriceEngine`
- `PjmPriceGroup`
- `PjmEnginePriceGroupMapping`
- `PjmOption`
- `PjmOptionChoice`

Aucun modele Prisma n'est ajoute ou modifie dans ce sprint.

## Tests automatises

```bash
npm run test:sprint5
npm run dev:check
```

Le test verifie :

- le script `sync:pjm` ;
- le runner explicite ;
- la persistance via Prisma `upsert` ;
- la normalisation des options et choix ;
- l'absence de calcul prix ;
- l'absence d'appel automatique au demarrage.

## Resultat attendu

Le projet peut synchroniser le catalogue PJM sur demande. Le prochain sprint pourra exposer ces donnees via une API admin stable avant de construire le backoffice.
