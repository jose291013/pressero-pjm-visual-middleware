# Sprint 49 - Pressero composite option keys

## Objectif

Corriger le mapping des options Pressero lorsque la cle envoyee n'est pas seulement l'ID PJM, mais une cle composee. Ces cles composees sont visibles dans le DOM Pressero.

## Probleme observe

Dans le DOM Pressero, le champ `Quantite d'exemplaires` est envoye avec une cle de type :

```text
prefix:optionId
```

Le middleware comparait encore principalement la cle complete avec l'ID PJM. Dans ce cas, le vrai parametre quantite pouvait etre visible dans Pressero mais mal rattache au payload PJM.

## Correction

Le provider sait maintenant comparer :

- la valeur complete ;
- chaque morceau separe par `:`.

Ainsi, une cle composee Pressero peut matcher le vrai parametre PJM `Quantite d'exemplaires`.

## Resultat attendu

Le payload `optionsandprice` envoye a PJM doit recevoir la quantite saisie par l'utilisateur sur le vrai `Key` du moteur PJM.

## Test automatise

```bash
npm run test:sprint49
```
