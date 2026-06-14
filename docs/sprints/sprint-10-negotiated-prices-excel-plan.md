# Sprint 10 - Negotiated Prices Excel Plan

## Objectif

Poser la fondation du module de prix negocies avant de generer un vrai fichier Excel.

Le sprint cree :

- le parseur de paliers depuis un champ texte ;
- le generateur de combinaisons d'options ;
- le plan de colonnes Excel ;
- une API de preview du nombre de lignes et des colonnes ;
- le contrat PJM pour la future creation de job.

## Regle Excel confirmee

L'Excel aura une ligne par combinaison d'options.

Les paliers de quantite sont saisis dans un champ texte, une quantite par ligne. Ces paliers deviennent les colonnes finales :

```text
Prix PJM 1 | Prix negocie 1 | Prix PJM 5 | Prix negocie 5 | ...
```

Si chaque option selectionnee contient un seul choix, le fichier contient une seule ligne. Si plusieurs choix sont selectionnes dans une ou plusieurs options, le generateur cree le produit cartesien de ces choix.

## Fichiers modifies ou ajoutes

- `package.json`
- `src/app.ts`
- `src/modules/negotiated-prices/negotiatedPrices.types.ts`
- `src/modules/negotiated-prices/combinationGenerator.service.ts`
- `src/modules/negotiated-prices/negotiatedPricesExcel.service.ts`
- `src/modules/negotiated-prices/negotiatedPrices.service.ts`
- `src/modules/negotiated-prices/negotiatedPrices.controller.ts`
- `src/modules/negotiated-prices/negotiatedPrices.routes.ts`
- `src/modules/pjm-sync/pjmContracts.types.ts`
- `src/modules/pjm-sync/pjmClient.ts`
- `docs/architecture/negotiated-prices-excel-model.md`
- `docs/architecture/pjm-endpoints.md`
- `docs/sprints/sprint-10-negotiated-prices-excel-plan.md`
- `scripts/test-sprint-10-negotiated-prices-excel-plan.mjs`

## Endpoints ajoutes

- `GET /negotiated-prices`
- `POST /negotiated-prices/preview`

## Modeles Prisma ajoutes ou modifies

Aucun modele Prisma n'est ajoute ou modifie dans ce sprint.

Les modeles existants `NegotiatedPriceProfile`, `NegotiatedPriceCombinationSet` et `NegotiatedPriceImportJob` restent compatibles avec la prochaine etape d'import.

## Tests automatises

```bash
npm run test:sprint10
npm run dev:check
```

Le test verifie :

- le parseur de paliers ;
- le produit cartesien des choix ;
- les colonnes `Prix PJM <quantite>` et `Prix negocie <quantite>` ;
- les hashes stables par quantite ;
- l'endpoint de preview ;
- le contrat PJM `POST /public/jobs` ;
- la preservation de la reference V22.1.

## Resultat attendu

Le backend peut calculer le plan d'un export Excel de prix negocies sans appeler PJM ni creer de fichier. Cette fondation permettra ensuite de remplir les prix PJM par `optionsandprice`, puis de generer le `.xlsx`.
