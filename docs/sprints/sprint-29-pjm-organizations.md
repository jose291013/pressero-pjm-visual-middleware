# Sprint 29 - PJM Organizations

## Objectif

Utiliser PJM comme source officielle des organisations PJM disponibles et ne plus deduire cette liste a partir des prix negocies deja crees.

## Changements

- ajout du modele Prisma `PjmOrganization`;
- ajout de l'appel PJM `POST /public/Organizations/list`;
- synchronisation des organisations pendant la synchronisation globale PJM;
- lecture admin des organisations depuis la table PJM synchronisee;
- champ Organisation recherchable dans `Prix negocies`;
- champ Organisation ID rempli automatiquement et en lecture seule dans `Prix negocies`;
- conservation du meme comportement dans `Produits Pressero`;
- affichage plus descriptif des grilles negociees dans le select des produits Pressero, avec un resume des combinaisons/options.

## Fichiers modifies

- `prisma/schema.prisma`
- `src/modules/pjm-sync/pjmClient.ts`
- `src/modules/pjm-sync/pjmContracts.types.ts`
- `src/modules/pjm-sync/pjmSync.types.ts`
- `src/modules/pjm-sync/pjmSyncCatalog.service.ts`
- `src/modules/pjm-sync/pjmSyncAdmin.service.ts`
- `src/public/admin/index.html`
- `src/public/admin/admin.js`
- `docs/architecture/pjm-sync-model.md`
- `package.json`

## Test automatise

```bash
npm run test:sprint29
```

Le test verifie le modele local, l'appel PJM, la synchro des organisations, les champs readonly, les datalists des deux ecrans et le libelle enrichi des grilles negociees.

## Resultat attendu

Apres une synchronisation PJM globale, les ecrans `Prix negocies` et `Produits Pressero` permettent de rechercher une organisation par nom. L'ID PJM correspondant est rempli automatiquement et reste en lecture seule.
