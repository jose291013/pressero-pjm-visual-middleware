# Sprint 50 - PJM options sanitize flow

## Objectif

Aligner le calcul live Pressero avec la logique observee dans `saas-orchestrator`.

Le middleware ne doit plus remplacer les quantites PJM avec la quantite generique Pressero. Les quantites PJM, y compris `Quantite d'exemplaires`, doivent rester des options natives envoyees par Pressero avec leurs propres `Key` et `Value`.

## Flux retenu

Pour un produit standard en mode `pjmLive`, le provider JSON suit maintenant ce flux :

1. lire les options selectionnees dans le payload Pressero ;
2. conserver les couples `{ Key, Value }` tels que recus ;
3. appeler PJM en `options` avec ces valeurs ;
4. utiliser le retour PJM pour supprimer les valeurs devenues incompatibles ;
5. appeler PJM en `optionsandprice` avec les valeurs compatibles.

Ce comportement reprend le principe du `saas-orchestrator` : PJM reste responsable des incompatibilites, de la validation des options et du prix.

## Comportement important

- Le middleware ne remplace plus la quantite PJM par `body.quantity`.
- Le middleware ne retente plus automatiquement avec une quantite minimale extraite d'un message d'erreur.
- Les champs libres PJM sont conserves si PJM les retourne toujours comme options valides.
- Les choix fermes sont conserves uniquement si leur valeur existe encore dans le retour `options`.
- Les logs Render exposent `pjm-live-flow` avec le nombre de valeurs initiales, d'options PJM rafraichies et de valeurs envoyees a `optionsandprice`.

## Test automatise

```bash
npm run test:sprint50
```
