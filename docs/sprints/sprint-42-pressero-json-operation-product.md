# Sprint 42 - Pressero JSON Operation Product

## Objectif

Adapter le provider Pressero au format JSON reel observe dans Render.

Les appels Pressero arrivent sur la meme URL :

```text
POST /pressero-pricing/json
```

Mais le body contient :

```text
operation
product
options
quantity
customer
```

## Changement

Le middleware lit maintenant :

- `operation` pour detecter si Pressero demande les options ou le prix;
- `product` pour retrouver le `MIS Product ID`;
- `quantity` directement depuis le body quand Pressero calcule le prix;
- `options` pour preparer la future lecture des choix selectionnes.

## Diagnostic Render

Les logs `[pressero-pricing] request` affichent maintenant :

- `operation`;
- `productKeys`;
- `rawOptionCount`;
- `productId`;
- `mode`.

Cela permet de confirmer si le `MIS Product ID` est bien dans l'objet `product` et si Pressero utilise une valeur d'operation attendue pour les options.

## Note importante

Le prix diagnostic reste volontairement actif :

```text
prix = quantity * 12.34
```

La prochaine etape dependra du nouveau log Render :

- si `mode` devient `options`, on verifiera `optionCount` et `choiceCount`;
- si `mode` reste `price`, il faudra mapper precisement les valeurs possibles de `operation`;
- si `productId` reste `null`, il faudra ajouter le nom exact du champ MIS Product ID dans `product`.

## Tests automatises

```text
npm run test:sprint42
npm run build
```
