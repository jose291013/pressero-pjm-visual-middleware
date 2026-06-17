# Sprint 27 - Generated MIS Product ID

## Objectif

Clarifier le role du champ Pressero `MIS Product ID price 1`.

Pressero ne genere pas cette reference. Elle est creee par le middleware et doit etre importee dans la colonne produit Pressero:

```text
MIS Product ID price 1
```

Cette reference existe pour tous les produits, que le mode soit:

- `PJM standard`;
- `Prix negocie`.

## Changement fonctionnel

Le `misProductId` de `PresseroProductConfig` devient le MISID produit externe.

Il est genere par le middleware lors de la creation si le formulaire n'en fournit pas. Dans l'admin, le champ est en lecture seule afin d'eviter de le confondre avec une saisie Pressero.

La reference negociee reste separee:

```text
MIS Product ID price 1 -> configuration produit middleware
Grille negociee interne -> profil de prix negocie optionnel
```

## Interface admin

Dans `Produits Pressero`:

- le champ `MIS Product ID price 1` est genere automatiquement;
- la carte de configuration affiche la valeur a copier dans Pressero;
- une action `Copier` permet de copier cette valeur;
- le champ de prix negocie est renomme `Grille de prix negociee interne`.

## Tests automatises

```bash
npm run test:sprint27
```

Le test verifie la generation backend, le champ admin en lecture seule, l'action de copie et la reference V22.1.

## Resultat attendu

Pour l'import produit Pressero:

```text
Pricing Engine price 1     -> moteur externe Pressero qui pointe vers le middleware
MIS Product ID price 1     -> MISID produit genere par le middleware
```

Le middleware utilise ensuite ce MISID produit pour retrouver le moteur PJM, le groupe de prix, les mappings images et, si besoin, la grille negociee interne.
