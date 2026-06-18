# Sprint 33 - Visual Option Mapping Admin

## Objectif

Créer l'écran d'administration qui relie les choix d'options PJM aux images/icônes de la bibliothèque média.

Le flux attendu est :

```text
Moteur PJM
-> liste des options et choix PJM
-> proposition de match par nom normalisé
-> export Excel pour préparation en masse
-> import Excel pour sauvegarder les mappings
-> VisualOptionMapping stable
```

## Fichiers modifiés

- `src/modules/visual-options/visualOptions.types.ts`
- `src/modules/visual-options/visualOptions.service.ts`
- `src/modules/visual-options/visualOptions.controller.ts`
- `src/modules/visual-options/visualOptions.routes.ts`
- `src/app.ts`
- `src/public/admin/index.html`
- `src/public/admin/admin.js`
- `src/public/admin/admin.css`
- `package.json`
- `docs/architecture/visual-options-model.md`
- `docs/architecture/middleware-overview.md`
- `scripts/test-sprint-33-visual-option-mapping-admin.mjs`

## Endpoints ajoutés

- `GET /visual-options`
- `GET /visual-options/admin/engines/:engineId/options`
- `POST /visual-options/admin/engines/:engineId/auto-match`
- `GET /visual-options/admin/engines/:engineId/export`
- `POST /visual-options/admin/engines/:engineId/import`

## Modèle de données

Aucun nouveau modèle Prisma.

Le sprint utilise :

- `PjmPriceEngine`
- `PjmOption`
- `PjmOptionChoice`
- `MediaAsset`
- `VisualOptionMapping`

`VisualOptionMapping` reste la table stable entre un choix PJM et un asset média.

## Interface admin

La section `Mappings` permet de :

- choisir un moteur PJM ;
- voir tous ses choix d'options ;
- distinguer les choix déjà mappés, auto-matchables ou manquants ;
- lancer l'auto-mapping par clé normalisée ;
- exporter un fichier Excel de mapping ;
- réimporter le fichier rempli avec la clé image à associer.

## Excel

Le fichier exporté contient les colonnes lisibles pour l'administrateur et des colonnes techniques cachées.

La colonne principale à remplir est :

```text
Cle image a associer
```

La valeur attendue est la clé `MediaAsset.key`, généralement produite automatiquement depuis le nom du fichier importé dans le ZIP.

## Tests automatisés

Script ajouté :

```text
scripts/test-sprint-33-visual-option-mapping-admin.mjs
```

Commande :

```text
npm run test:sprint33
```

Le test vérifie :

- le montage des routes `/visual-options` ;
- les fonctions de service Excel/import/auto-match ;
- l'écran admin `Mappings` ;
- les styles principaux ;
- les documents d'architecture ;
- les marqueurs de la référence V22.1.

## Résultat attendu

L'administrateur peut récupérer toutes les options d'un moteur PJM et préparer en masse le mapping option/image.

Cette étape prépare la génération du JSON Pressero visuel, sans casser la logique V22.1 :

```text
Interface visuelle
-> vrais champs Pressero/PJM
-> recalcul PJM natif
-> prix natif ou prix négocié middleware
```
