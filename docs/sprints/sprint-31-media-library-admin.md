# Sprint 31 - Media Library Admin

## Objectif

Activer la bibliotheque d'images/icones dans le backoffice.

Ce sprint pose la base necessaire au futur mapping visuel `choix PJM -> image`. Les assets sont references par URL avec leurs metadonnees, afin de pouvoir utiliser rapidement des fichiers heberges sur S3/CDN ou servis par le middleware.

## Changements

- activation du module `media-library`;
- endpoints admin pour lister, creer, modifier et supprimer une image;
- generation d'une cle interne normalisee;
- detection simple du type MIME depuis le nom de fichier;
- protection contre la suppression d'une image deja associee a un mapping visuel;
- nouvel onglet `Images` dans le backoffice;
- formulaire de saisie des metadonnees image;
- grille de consultation avec preview, compteur de mappings et actions d'edition/suppression.

## Endpoints

```text
GET    /media-library
GET    /media-library/admin/assets
POST   /media-library/admin/assets
PUT    /media-library/admin/assets/:assetId
DELETE /media-library/admin/assets/:assetId
```

## Fichiers modifies

- `src/app.ts`
- `src/modules/media-library/mediaLibrary.controller.ts`
- `src/modules/media-library/mediaLibrary.routes.ts`
- `src/modules/media-library/mediaLibrary.service.ts`
- `src/modules/media-library/mediaLibrary.types.ts`
- `src/public/admin/index.html`
- `src/public/admin/admin.js`
- `src/public/admin/admin.css`
- `docs/architecture/visual-options-model.md`
- `docs/architecture/middleware-overview.md`
- `package.json`

## Test automatise

```bash
npm run test:sprint31
```

## Resultat attendu

L'administrateur peut ouvrir l'onglet `Images`, ajouter une image par URL, voir sa miniature, modifier ses metadonnees et supprimer l'asset tant qu'il n'est pas utilise dans un mapping visuel.
