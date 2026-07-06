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

Le calcul de prix lit ensuite la quantite dans cet ordre :

1. valeur recue dans le vrai parametre PJM de quantite ;
2. champ quantite generique Pressero ;
3. fallback interne.

## Resultat attendu

Pressero doit pouvoir afficher un champ pour `Quantite d'exemplaires`.

Si l'utilisateur renseigne cette valeur, le middleware l'envoie a PJM dans `optionsandprice` sur le vrai `Key` du moteur PJM.

## Test automatise

```bash
npm run test:sprint47
```
