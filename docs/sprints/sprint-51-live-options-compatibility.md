# Sprint 51 - Live options compatibility

## Objectif

Corriger la branche `GetOptionsForProduct` du provider Pressero.

Avant ce sprint, le prix live appelait bien PJM avec le flux `options` puis `optionsandprice`, mais la branche qui renvoie les options a Pressero continuait a retourner les options synchronisees en base. Les incompatibilites PJM ne pouvaient donc pas se reflter correctement dans les listes visibles cote Pressero.

## Correction

`buildPresseroOptionsForProduct` recoit maintenant le payload Pressero courant.

Pour les produits en mode standard PJM :

1. le middleware lit les options deja selectionnees dans le payload Pressero ;
2. il appelle PJM en `options` avec ces couples `{ Key, Value }` ;
3. il reconstruit la reponse `PricingParameter[]` a partir du retour live PJM ;
4. il conserve un fallback vers les options synchronisees si PJM ne renvoie aucune option exploitable.

La reponse options logue aussi `selectedOptionCount`, afin de verifier que Pressero renvoie bien les choix courants lors des refreshs d'options.

## Resultat attendu

Quand l'utilisateur change une option dans Pressero, l'appel `options` doit pouvoir renvoyer uniquement les choix encore compatibles selon PJM.

Le prix reste calcule dans l'appel suivant via `optionsandprice`.

## Test automatise

```bash
npm run test:sprint51
```
