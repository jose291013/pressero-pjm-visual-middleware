# Sprint 7 - Admin UI

## Objectif

Creer le premier backoffice visuel minimal pour consulter le catalogue PJM synchronise.

Le sprint ajoute une page statique servie par Express. Elle lit l'API admin du Sprint 6 et affiche :

- resume du catalogue ;
- liste des moteurs PJM ;
- detail moteur ;
- groupes de prix associes ;
- options et choix.

## Fichiers modifies ou ajoutes

- `package.json`
- `README.md`
- `src/app.ts`
- `src/public/admin/index.html`
- `src/public/admin/admin.css`
- `src/public/admin/admin.js`
- `docs/architecture/admin-api.md`
- `docs/sprints/sprint-7-admin-ui.md`
- `scripts/test-sprint-7-admin-ui.mjs`

## Endpoints ajoutes

- `GET /admin`
- `GET /public/admin/admin.css`
- `GET /public/admin/admin.js`

## Modeles Prisma ajoutes ou modifies

Aucun modele Prisma n'est ajoute ou modifie dans ce sprint.

## Tests automatises

```bash
npm run test:sprint7
npm run dev:check
```

Le test verifie :

- la route `/admin` ;
- les assets statiques ;
- les appels API admin ;
- l'absence d'appel de synchronisation PJM ;
- l'echappement HTML des donnees affichees.

## Resultat attendu

Le backoffice minimal est consultable a `http://localhost:3000/admin`. Il est pret a recevoir les prochains modules : bibliotheque media, mapping visuel et generation de configuration Pressero.
