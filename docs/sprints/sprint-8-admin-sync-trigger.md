# Sprint 8 - Admin Sync Trigger

## Objectif

Ajouter un declencheur explicite de synchronisation PJM depuis le backoffice.

Le sprint permet de lancer la synchronisation catalogue sans demarrer d'appel PJM automatiquement au lancement du serveur. La sync utilise le client existant et le endpoint PJM deja documente :

```http
POST https://ams.printjobmanager.com/api/public/productEngines/list
```

Le service continue ensuite a utiliser le premier `EnginePriceGroupIntegrationId` d'un moteur pour demander ses options via `/public/engine` avec `Operation: "options"`.

## Fichiers modifies ou ajoutes

- `package.json`
- `src/modules/pjm-sync/pjmSync.controller.ts`
- `src/modules/pjm-sync/pjmSync.routes.ts`
- `src/public/admin/index.html`
- `src/public/admin/admin.css`
- `src/public/admin/admin.js`
- `docs/architecture/admin-api.md`
- `docs/architecture/pjm-endpoints.md`
- `docs/sprints/sprint-8-admin-sync-trigger.md`
- `scripts/test-sprint-8-admin-sync-trigger.mjs`

## Endpoints ajoutes

- `POST /pjm-sync/admin/sync`

## Modeles Prisma ajoutes ou modifies

Aucun modele Prisma n'est ajoute ou modifie dans ce sprint.

## Tests automatises

```bash
npm run test:sprint8
npm run dev:check
```

Le test verifie :

- la route `POST /pjm-sync/admin/sync` ;
- l'utilisation du service de synchronisation existant ;
- le bouton backoffice de synchronisation ;
- l'absence d'appel `optionsandprice` ;
- l'absence de synchronisation automatique au demarrage du serveur ;
- la preservation de la reference V22.1.

## Resultat attendu

Le backoffice affiche un bouton `Synchroniser PJM`. Un clic lance la synchronisation catalogue, affiche un statut lisible, puis recharge les compteurs et la liste des moteurs.

Si les variables PJM ne sont pas configurees, l'API retourne une erreur JSON claire au lieu d'une page d'erreur HTML.
