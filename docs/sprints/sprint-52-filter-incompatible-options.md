# Sprint 52 - Filter incompatible options

## Objectif

Ne plus afficher dans Pressero les options ou choix que PJM signale comme incompatibles.

Apres le Sprint 51, le provider appelait bien PJM en `options`, mais certains choix pouvaient encore etre renvoyes avec un indicateur d'incompatibilite. Dans ce cas, Pressero les affichait, puis PJM les ignorait au calcul. Le resultat etait correct techniquement, mais mauvais pour l'utilisateur.

## Correction

Le provider filtre maintenant les options et choix PJM avant de construire la reponse Pressero.

Un element est retire s'il porte un flag de suppression ou d'incompatibilite, notamment :

- `Suppress` ou `suppress`;
- `Hidden` ou `hidden`;
- `Disabled` ou `disabled`;
- `Available=false`;
- `Enabled=false`;
- `Visible=false`.

Le meme filtre est utilise avant `optionsandprice`, afin qu'un choix deja present dans le payload Pressero mais devenu incompatible ne soit pas conserve pour le calcul.

## Resultat attendu

Quand PJM retire un choix compatible dans le retour `options`, Pressero ne doit plus proposer ce choix a l'utilisateur.

## Test automatise

```bash
npm run test:sprint52
```
