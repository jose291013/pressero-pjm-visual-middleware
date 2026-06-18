# Sprint 32 - Media ZIP Import

## Objectif

Permettre le chargement massif d'images/icones depuis une archive ZIP afin de preparer le mapping automatique `choix PJM -> image`.

Les fichiers importes sont stockes dans un dossier public servi par le middleware. La base ne stocke que les metadonnees et l'URL publique.

## Organisation du stockage

Par defaut :

```text
src/public/media/assets/
```

URL publique :

```text
/public/media/assets/nom-normalise.webp
```

Sur Render, le dossier peut etre deplace via :

```text
MEDIA_ASSETS_DIR=/var/data/media/assets
```

Cela permet de pointer vers un disque Render persistant si necessaire. Sans disque persistant, les fichiers uploades dans le conteneur peuvent etre perdus lors d'un redeploiement ou redemarrage.

## Regles d'import

- le ZIP est envoye via le champ multipart `archive`;
- seuls `.svg`, `.webp`, `.png`, `.jpg`, `.jpeg` sont acceptes;
- les chemins internes dangereux sont ignores;
- le nom de fichier est normalise;
- la cle media est basee sur le nom sans extension;
- un fichier deja connu met a jour le `MediaAsset` existant au lieu de creer un doublon.

Exemple :

```text
Papier couche 135 g.webp -> papier-couche-135-g
```

## Endpoint ajoute

```text
POST /media-library/admin/assets/import-zip
```

## Fichiers modifies

- `.env.example`
- `package.json`
- `package-lock.json`
- `src/app.ts`
- `src/config/env.ts`
- `src/modules/media-library/mediaLibrary.controller.ts`
- `src/modules/media-library/mediaLibrary.routes.ts`
- `src/modules/media-library/mediaLibrary.service.ts`
- `src/modules/media-library/mediaLibrary.types.ts`
- `src/public/admin/index.html`
- `src/public/admin/admin.js`
- `src/public/admin/admin.css`
- `src/public/media/assets/.gitkeep`
- `docs/architecture/middleware-overview.md`
- `docs/architecture/visual-options-model.md`

## Test automatise

```bash
npm run test:sprint32
```

## Resultat attendu

L'administrateur peut charger un ZIP dans l'onglet `Images`. Le middleware extrait les images autorisees, les stocke dans le dossier public, cree ou met a jour les assets en base et affiche un resume de l'import.
