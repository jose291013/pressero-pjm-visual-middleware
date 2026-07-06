# Sprint 41 - Pressero Pricing Render Diagnostics

## Objectif

Ajouter des logs explicites sur le provider Pressero afin de comprendre pourquoi Pressero calcule le prix mais n'affiche pas encore les options du moteur externe.

## Logs Render attendus

Chaque appel vers `/pressero-pricing/json` ecrit une ligne commencant par :

```text
[pressero-pricing]
```

Les evenements principaux sont :

```text
request
options-response
options-error
price-response
```

Le log `request` indique :

- `method` : methode HTTP appelee par Pressero;
- `path` : chemin reel appele;
- `mode` : `options` ou `price`;
- `productId` : MIS Product ID detecte;
- `quantity` : quantite detectee;
- `bodyKeys` : cles recues dans le body JSON;
- `queryKeys` : cles recues dans l'URL;
- `pricingParameterKeys` : parametres de prix recus;
- `selectedOptionCount` : nombre d'options selectionnees recues.

## Diagnostic attendu

Si Pressero n'affiche toujours que `Quantity`, les logs diront lequel de ces cas arrive :

- aucun appel `mode: "options"` n'arrive au middleware;
- l'appel options arrive sans `productId`;
- l'appel options arrive avec un `productId` inconnu;
- les options sont trouvees mais `optionCount` ou `choiceCount` vaut `0`;
- les options sont bien renvoyees, mais Pressero attend un autre shape JSON.

## Tests automatises

```text
npm run test:sprint41
npm run build
```
