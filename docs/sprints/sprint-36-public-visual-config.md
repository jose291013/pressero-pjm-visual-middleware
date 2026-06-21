# Sprint 36 - Public Visual Product Config

## Objectif

Exposer un endpoint public qui permet à Pressero de récupérer la configuration visuelle d'un produit standard PJM à partir du `MIS Product ID`.

Ce sprint prépare le test réel Pressero avec :

```text
Produit Pressero
-> moteur externe standard
-> MIS Product ID middleware
-> JSON visuel public
-> images mappées aux vrais choix PJM
```

Le prix reste en mode PJM standard. Le JSON ne calcule aucun prix.

## Endpoint ajouté

```text
GET /pressero-config/public/products/:misProductId/visual-config
```

## Réponse attendue

Le JSON contient :

- le `MIS Product ID` middleware ;
- le mode `pjmLive` ;
- l'organisation ;
- le moteur PJM ;
- le groupe de prix PJM ;
- uniquement les options qui ont au moins un choix associé à une image ;
- les choix PJM avec leurs vrais IDs/valeurs ;
- les URLs d'images prêtes pour Pressero.

Les URLs déjà absolues, par exemple S3 ou CloudFront, sont conservées.

Les URLs locales `/public/media/assets/...` sont transformées en URLs absolues à partir de la requête, ce qui permettra à Render de renvoyer :

```text
https://middleware-render.onrender.com/public/media/assets/image.webp
```

## Fichiers modifiés

- `src/modules/pressero-config/presseroConfig.types.ts`
- `src/modules/pressero-config/presseroConfig.service.ts`
- `src/modules/pressero-config/presseroConfig.controller.ts`
- `src/modules/pressero-config/presseroConfig.routes.ts`
- `package.json`
- `scripts/test-sprint-36-public-visual-config.mjs`
- `docs/architecture/middleware-overview.md`
- `docs/architecture/visual-options-model.md`
- `docs/sprints/sprint-36-public-visual-config.md`

## Règles fonctionnelles

- L'endpoint accepte uniquement les configurations actives.
- L'endpoint accepte uniquement `PJM standard` (`pjmLive`) pour ce sprint.
- Une option PJM sans image mappée n'est pas envoyée.
- Un choix désactivé ou sans mapping actif n'est pas envoyé.
- Le front Pressero reste responsable de modifier les vrais champs PJM, conformément à V22.1.

## Tests automatisés

Script ajouté :

```text
scripts/test-sprint-36-public-visual-config.mjs
```

Commande :

```text
npm run test:sprint36
```

## Résultat attendu

L'administrateur peut créer une configuration produit Pressero standard, mapper les images, puis récupérer un JSON public via le `MIS Product ID`.

Ce JSON sera la base du futur script Pressero qui transformera les vrais choix PJM en boutons/images sans casser le recalcul natif.
