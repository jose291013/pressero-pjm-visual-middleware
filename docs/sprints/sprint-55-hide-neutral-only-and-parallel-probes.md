# Sprint 55 - Hide neutral-only groups and parallel probes

## Objectif

Ameliorer le resultat du Sprint 54.

Quand PJM ne laisse disponible qu'un choix neutre comme `Aucun`, le groupe visuel complet ne doit plus etre affiche. Par exemple, si le papier `135 gr` rend le `Pelliculage` impossible, l'utilisateur ne doit plus voir ni le label `Pelliculage`, ni le bouton `Aucun`.

Le test des choix candidats PJM devait aussi etre accelere, car le probing sequentiel pouvait rendre le temps de reponse trop long.

## Correction navigateur

`visual-configurator.js` detecte maintenant les groupes avec un seul choix neutre :

- `Aucun`;
- `none`;
- `non`;
- `sans`;
- `--Select--`;
- `choisir`.

Dans ce cas, le script masque le champ natif correspondant et ne rend pas le groupe visuel.

## Correction backend

Le probing des choix PJM est maintenant parallele par option avec `Promise.all`.

Le middleware evite aussi de prober les choix quand aucune valeur precedente n'a encore ete acceptee, car aucune incompatibilite contextuelle ne peut encore etre appliquee a cette premiere etape.

## Resultat attendu

- un groupe comme `Pelliculage` disparait entierement lorsqu'il ne reste que `Aucun`;
- la reponse des appels `options` doit etre plus rapide que le probing candidat par candidat sequentiel.

## Test automatise

```bash
npm run test:sprint55
```
