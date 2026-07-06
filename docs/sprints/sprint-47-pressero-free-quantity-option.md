# Sprint 47 - Pressero free quantity option

## Objectif

Afficher dans Pressero les parametres PJM libres, notamment `Quantite d'exemplaires`, au lieu de ne retourner que les options qui possedent des images.

## Probleme observe

Les images etaient bien visibles, mais le calculateur Pressero affichait seulement le champ generique `Quantity`.

Or PJM expose la quantite comme une option moteur, pas comme `Q1`. Le middleware devait donc retourner ce parametre dans `GetOptionsForProduct`.

## Correction

`GetOptionsForProduct` renvoie maintenant :

- les options PJM a choix avec leurs choix actifs ;
- les parametres libres PJM avec `Options: []`.

Le calcul de prix conserve ensuite les couples `{ Key, Value }` recus par Pressero. Depuis le Sprint 50, le middleware ne remplace plus la valeur du vrai parametre PJM par le champ generique `Quantity`.

## Resultat attendu

Pressero doit pouvoir afficher un champ pour `Quantite d'exemplaires`.

Si l'utilisateur renseigne cette valeur, Pressero la renvoie comme option native. Le middleware l'envoie d'abord a PJM en `options`, puis transmet a `optionsandprice` uniquement les valeurs encore compatibles.

## Test automatise

```bash
npm run test:sprint47
```
