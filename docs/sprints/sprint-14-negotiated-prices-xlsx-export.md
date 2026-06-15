# Sprint 14 - Negotiated Prices XLSX Export

## Objectif

Generer un vrai fichier `.xlsx` depuis l'ecran `Prix negocies`.

Le fichier reprend le plan valide au sprint precedent:

- une ligne par combinaison de choix;
- les colonnes contexte;
- les options lisibles;
- les paliers de quantite;
- une colonne `Prix PJM <palier>`;
- une colonne `Prix negocie <palier>`.

## Fichiers modifies

- `package.json`
- `package-lock.json`
- `src/modules/negotiated-prices/negotiatedPricesWorkbook.service.ts`
- `src/modules/negotiated-prices/negotiatedPrices.service.ts`
- `src/modules/negotiated-prices/negotiatedPrices.controller.ts`
- `src/modules/negotiated-prices/negotiatedPrices.routes.ts`
- `src/modules/negotiated-prices/negotiatedPrices.types.ts`
- `src/public/admin/index.html`
- `src/public/admin/admin.js`
- `docs/architecture/admin-api.md`
- `docs/architecture/negotiated-prices-excel-model.md`
- `scripts/test-sprint-14-negotiated-prices-xlsx-export.mjs`

## Dependances

Ajout de:

```text
exceljs
```

## Endpoint ajoute

```http
POST /negotiated-prices/export
```

Le payload est le meme que:

```http
POST /negotiated-prices/preview
```

La reponse est un fichier:

```http
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="..."
```

## Backoffice

L'ecran `Prix negocies` contient maintenant un bouton:

```text
Exporter Excel
```

Le bouton envoie le payload courant au backend et declenche le telechargement du fichier `.xlsx`.

## Structure du fichier

Le classeur contient:

- une feuille `Prix negocies`;
- une feuille `Aide`;
- des colonnes techniques masquees pour le futur import;
- les colonnes visibles d'edition des prix.

Les colonnes `Prix PJM <palier>` et `Prix negocie <palier>` sont vides dans ce sprint.

## Limite volontaire

Ce sprint ne calcule pas encore les prix PJM.

Le sprint suivant pourra appeler PJM `optionsandprice` pour remplir les colonnes `Prix PJM <palier>`.

## Tests automatises

```bash
npm run test:sprint14
npm run dev:check
```

## Resultat attendu

Depuis le backoffice, l'utilisateur peut exporter un fichier Excel exploitable pour verifier les lignes, les colonnes et la structure d'import future.
