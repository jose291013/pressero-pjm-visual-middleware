# Sprint 48 - Pressero numeric option and generic quantity

## Objectif

Corriger deux ecarts observes dans Pressero :

- le vrai parametre PJM `Quantite d'exemplaires` pouvait etre envoye comme valeur numerique ;
- le champ `Quantity generique` du plugin restait visible en plus du vrai parametre PJM.

## Correction provider

Le provider accepte maintenant les valeurs d'options Pressero de type :

- string ;
- number ;
- boolean.

Les valeurs sont converties en string avant la construction du payload PJM.

Cela evite de perdre le vrai parametre PJM quand Pressero envoie par exemple `100` au lieu de `"100"`.

## Correction runtime visuel

Le script Pressero masque le champ `Quantity` generique uniquement quand un vrai champ quantite PJM est present dans le DOM.

Le vrai champ `Quantite d'exemplaires` reste visible et natif.

## Test automatise

```bash
npm run test:sprint48
```
