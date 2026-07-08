# Sprint 59 - Stable Option Render After Quantity Reorder

## Objectif

Eviter la disparition complete des options visuelles lorsque l'ordre des parametres PJM change, notamment quand la quantite remonte en premiere position.

Dans ce cas, PJM peut renvoyer un parametre libre en premier. Le provider Pressero recevait bien des options, mais la page pouvait ne rendre aucun champ optionnel, ce qui se voyait ensuite dans les logs par `rawOptionCount: 0`.

## Correction provider

La reponse `GetOptionsForProduct` ordonne maintenant les parametres pour envoyer d'abord les parametres avec choix, puis les parametres libres `Options: []`.

Cela garde les listes visuelles en tete du contrat Pressero et evite qu'un champ libre de quantite bloque ou perturbe le rendu des options suivantes.

## Correction runtime visuel

Le runtime public ne montre plus immediatement le warning `Aucune option visuelle...` quand aucun champ natif n'est encore trouve.

Il attend plusieurs cycles courts de rerender pour laisser Pressero construire ses champs natifs, puis affiche le warning uniquement si aucune correspondance n'apparait apres ce delai.

## Resultat attendu

- les options visuelles reapparaissent meme si la quantite a ete deplacee dans PJM;
- `rawOptionCount` doit redevenir superieur a 0 apres selection utilisateur;
- le warning ne doit plus apparaitre trop tot pendant le chargement Pressero.

## Test automatise

```bash
npm run test:sprint59
```
