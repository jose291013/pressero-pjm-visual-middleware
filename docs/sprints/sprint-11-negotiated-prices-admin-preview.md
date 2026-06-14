# Sprint 11 - Negotiated Prices Admin Preview

## Objectif

Ajouter le premier ecran backoffice `Prix negocies`.

Cet ecran permet de preparer un futur export Excel sans encore generer de fichier :

- saisir l'organisation ;
- choisir un moteur PJM ;
- choisir un groupe de prix ;
- selectionner plusieurs choix dans les options du moteur ;
- saisir les paliers de quantite, une quantite par ligne ;
- previsualiser le nombre de lignes et les colonnes Excel attendues.

## Fichiers modifies ou ajoutes

- `package.json`
- `src/public/admin/index.html`
- `src/public/admin/admin.css`
- `src/public/admin/admin.js`
- `docs/architecture/admin-api.md`
- `docs/sprints/sprint-11-negotiated-prices-admin-preview.md`
- `scripts/test-sprint-11-negotiated-prices-admin-preview.mjs`

## Endpoints utilises

- `GET /pjm-sync/admin/price-engines`
- `GET /pjm-sync/admin/price-engines/:id`
- `POST /negotiated-prices/preview`

## Modeles Prisma ajoutes ou modifies

Aucun modele Prisma n'est ajoute ou modifie dans ce sprint.

## Tests automatises

```bash
npm run test:sprint11
npm run dev:check
```

Le test verifie :

- la navigation backoffice vers `Prix negocies` ;
- les champs organisation, moteur, groupe de prix et paliers ;
- le rendu des choix d'options sous forme de cases a cocher ;
- l'appel `POST /negotiated-prices/preview` ;
- l'affichage du nombre de lignes et des colonnes Excel ;
- l'absence de generation Excel prematuree ;
- la preservation de la reference V22.1.

## Resultat attendu

L'admin affiche une page `Prix negocies` utilisable pour calculer une preview du futur Excel. Le prochain sprint pourra transformer ce plan en fichier `.xlsx`.
