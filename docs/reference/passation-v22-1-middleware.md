Nous allons créer un nouveau projet nommé `pressero-pjm-visual-middleware`.

Objectif final :
Créer un middleware entre Pressero et PrintJobManager/PJM pour construire une interface visuelle rapide avec images/icônes, tout en conservant PJM comme source des moteurs, options, règles, calculs et prix.

Référence fonctionnelle importante :
Le fichier `docs/reference/pressero_visual_calculator_v22_1_quantities_2_columns.txt` contient la version V22.1 validée.

Ce que cette version prouve :

* les quantités Pressero/PJM doivent rester natives ;
* il ne faut pas recréer de faux champs quantité ;
* il ne faut pas injecter les quantités en JavaScript ;
* il ne faut pas masquer tout le calculateur PJM ;
* il faut seulement masquer les lignes natives des options visuelles transformées ;
* une option image doit modifier le vrai `select` PJM ;
* le script doit déclencher un seul événement `change` ;
* PJM/Pressero doit rester responsable du recalcul, du prix et du panier.

Méthodologie à respecter :
Interface visuelle → vrais champs Pressero/PJM → recalcul PJM natif → prix natif → panier natif.

Ne pas casser cette logique.

Projet middleware à construire progressivement :

1. Synchroniser les catégories produits PJM, groupes de prix, moteurs de prix, options et choix.
2. Créer une bibliothèque d’images/icônes légères.
3. Associer les images aux choix d’options PJM.
4. Générer un JSON léger utilisable côté Pressero pour afficher l’interface visuelle.
5. Prévoir plus tard un module de prix négociés avec export/import Excel.

Stack souhaitée :

* Node.js
* TypeScript
* Express
* Prisma
* PostgreSQL
* ExcelJS plus tard
* tests automatisés avec scripts Node.js

## Structure de projet à respecter

Le projet doit être organisé de manière claire, modulaire et évolutive.

Structure cible :

```text
pressero-pjm-visual-middleware/
├── docs/
│   ├── reference/
│   │   ├── pressero_visual_calculator_v22_1_quantities_2_columns.txt
│   │   └── passation-v22-1-middleware.md
│   ├── sprints/
│   │   └── sprint-1-foundation.md
│   └── architecture/
│       ├── middleware-overview.md
│       ├── pjm-sync-model.md
│       ├── visual-options-model.md
│       └── negotiated-prices-excel-model.md
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── scripts/
│   ├── test-sprint-1-foundation.mjs
│   └── dev-check.mjs
│
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config/
│   │   ├── env.ts
│   │   └── prisma.ts
│   │
│   ├── modules/
│   │   ├── health/
│   │   │   ├── health.routes.ts
│   │   │   └── health.controller.ts
│   │   │
│   │   ├── pjm-sync/
│   │   │   ├── pjmSync.routes.ts
│   │   │   ├── pjmSync.controller.ts
│   │   │   ├── pjmSync.service.ts
│   │   │   └── pjmSync.types.ts
│   │   │
│   │   ├── visual-options/
│   │   │   ├── visualOptions.routes.ts
│   │   │   ├── visualOptions.controller.ts
│   │   │   ├── visualOptions.service.ts
│   │   │   └── visualOptions.types.ts
│   │   │
│   │   ├── media-library/
│   │   │   ├── mediaLibrary.routes.ts
│   │   │   ├── mediaLibrary.controller.ts
│   │   │   ├── mediaLibrary.service.ts
│   │   │   └── mediaLibrary.types.ts
│   │   │
│   │   ├── pressero-config/
│   │   │   ├── presseroConfig.routes.ts
│   │   │   ├── presseroConfig.controller.ts
│   │   │   ├── presseroConfig.service.ts
│   │   │   └── presseroConfig.types.ts
│   │   │
│   │   └── negotiated-prices/
│   │       ├── negotiatedPrices.routes.ts
│   │       ├── negotiatedPrices.controller.ts
│   │       ├── negotiatedPrices.service.ts
│   │       ├── negotiatedPricesExcel.service.ts
│   │       ├── combinationGenerator.service.ts
│   │       └── negotiatedPrices.types.ts
│   │
│   ├── shared/
│   │   ├── errors/
│   │   ├── http/
│   │   ├── utils/
│   │   └── validators/
│   │
│   └── public/
│       ├── admin/
│       └── pressero/
│           └── visual-configurator.js
│
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Rôle des principaux dossiers

### `docs/reference`

Contient les documents de référence qui ne doivent pas être modifiés sans raison.

Le fichier V22.1 est une référence fonctionnelle importante. Il montre la logique stable validée dans Pressero :

```text
Interface visuelle
→ vrais champs Pressero/PJM
→ recalcul PJM natif
→ prix natif
→ panier natif
```

### `docs/architecture`

Contient les documents de conception du middleware.

À prévoir :

* vue générale du middleware ;
* modèle de synchronisation PJM ;
* modèle de mapping options/images ;
* modèle export/import Excel des prix négociés ;
* stratégie de cache et performance.

### `docs/sprints`

Contient un document par sprint.

Chaque sprint doit décrire :

* objectif ;
* fichiers modifiés ;
* endpoints ajoutés ;
* modèles Prisma ajoutés ou modifiés ;
* tests automatisés ;
* résultat attendu.

### `prisma`

Contient le schéma de base de données et les migrations.

Prisma doit rester la source principale du modèle de données.

### `scripts`

Contient les tests automatisés et scripts de validation.

Chaque sprint doit avoir au minimum un script de test dédié.

Exemple :

```text
scripts/test-sprint-1-foundation.mjs
scripts/test-sprint-2-pjm-sync-foundation.mjs
scripts/test-sprint-3-media-library-foundation.mjs
```

### `src/modules`

Chaque domaine fonctionnel doit être isolé dans son propre module.

Modules prévus :

```text
health
pjm-sync
visual-options
media-library
pressero-config
negotiated-prices
```

Cette séparation est importante pour éviter de mélanger :

* la synchronisation PJM ;
* la bibliothèque image ;
* le mapping visuel ;
* la génération du JSON Pressero ;
* les prix négociés ;
* l’export/import Excel.

## Modules fonctionnels attendus

### `pjm-sync`

Responsable de la récupération et du stockage local des données PJM :

* catégories produits ;
* groupes de prix ;
* moteurs de prix ;
* options ;
* choix d’options.

Dans les premiers sprints, ce module peut fonctionner avec des données mockées ou seedées.

Il ne faut pas encore connecter réellement l’API PJM tant que la structure n’est pas stable.

### `media-library`

Responsable de la bibliothèque d’images et icônes.

Objectifs :

* stocker les métadonnées des images ;
* gérer les noms normalisés ;
* permettre une association automatique par nom ;
* conserver une image très légère pour le front Pressero.

Formats recommandés :

```text
SVG pour icônes simples
WebP pour images réalistes légères
PNG seulement si nécessaire
```

### `visual-options`

Responsable du mapping entre les choix PJM et les images.

Exemple :

```text
PJM option choice → media asset
Papier couché 135 g → papier-couche-135g.webp
Forex 3 mm → forex-3mm.webp
Livraison express → livraison-express.svg
```

Le mapping final doit être sauvegardé avec des identifiants stables, pas seulement avec le nom de l’image.

### `pressero-config`

Responsable de la génération du JSON léger utilisé dans Pressero.

Ce JSON doit contenir uniquement les données nécessaires au front client :

* moteur ;
* options visuelles ;
* choix ;
* images ;
* vrais IDs ou valeurs PJM ;
* ordre d’affichage.

Le script Pressero doit rester léger et rapide.

### `negotiated-prices`

Responsable des prix négociés.

Ce module doit gérer :

* choix du client / organisation ;
* choix du moteur PJM ;
* sélection des options à inclure ;
* sélection des choix à inclure ;
* paliers de quantités ;
* paliers de pages ou autres variables ;
* calcul du nombre de combinaisons ;
* génération d’un Excel ;
* import de l’Excel rempli ;
* validation des lignes importées ;
* sauvegarde des prix négociés.

L’édition massive des prix négociés doit se faire prioritairement par export/import Excel, pas dans une grande table HTML.

## Règles importantes pour Codex

Codex doit respecter ces règles :

1. Ne pas mélanger tous les fichiers dans `src/`.
2. Créer un module par domaine fonctionnel.
3. Ne pas créer une interface complexe au Sprint 1.
4. Ne pas connecter réellement PJM au Sprint 1.
5. Ne pas créer l’import/export Excel au Sprint 1.
6. Ne pas modifier la logique validée dans V22.1.
7. Préparer chaque sprint avec un test automatisé.
8. Garder une architecture compatible avec une future interface admin complète.
9. Prévoir une base de données propre avec Prisma.
10. Utiliser Git et travailler par commits de sprint.

## Règle de performance

Le middleware doit générer une configuration Pressero légère.

Le front Pressero ne doit pas charger toute la base PJM.

Il doit charger uniquement les données utiles au produit courant.

Objectif :

```text
Chargement rapide
Images légères
JSON minimal
Aucun calcul de prix côté script Pressero
Prix et panier conservés côté Pressero/PJM
```

## Règle pour les prix négociés

Les prix négociés doivent être gérés par combinaison.

Une combinaison doit être identifiable par une signature stable :

```text
clientId
engineId
quantity
pages
optionChoiceIds
combinationHash
```

Le fichier Excel exporté doit contenir :

* les colonnes lisibles pour l’utilisateur ;
* les prix réels PJM si disponibles ;
* une colonne prix négocié ;
* des colonnes techniques cachées ou protégées ;
* un identifiant de combinaison stable.

Le middleware doit être capable de réimporter l’Excel et de reconnaître chaque combinaison sans ambiguïté.


Sprint 1 attendu :
Créer uniquement la fondation du projet :

* `package.json`
* `tsconfig.json`
* structure `src/`
* serveur Express
* endpoint `GET /health`
* configuration Prisma
* modèles Prisma initiaux :

  * `PjmProductCategory`
  * `PjmPriceGroup`
  * `PjmPriceEngine`
  * `PjmOption`
  * `PjmOptionChoice`
  * `MediaAsset`
  * `VisualOptionMapping`
  * `NegotiatedPriceProfile`
  * `NegotiatedPriceCombinationSet`
  * `NegotiatedPriceImportJob`
* script de test automatisé `scripts/test-sprint-1-foundation.mjs`

Important :
Ne pas encore créer de connecteur réel PJM.
Ne pas encore créer d’import Excel.
Ne pas encore créer d’interface complexe.
Ne pas modifier la logique V22.1.
Préparer une base propre, extensible et testable.
