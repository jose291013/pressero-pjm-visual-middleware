# Sprint 43 - Pressero Product String

## Objectif

Corriger la lecture du `MIS Product ID` quand Pressero envoie `product` directement sous forme de string.

Les logs Render montrent :

```text
bodyKeys: ["operation","product","options"]
productKeys: []
productId: null
```

Cela indique que `product` existe, mais n'est pas un objet avec des cles. Le cas probable est :

```json
{
  "operation": "options",
  "product": "MWP-...",
  "options": []
}
```

## Changement

Le middleware lit maintenant :

- `product` string comme `MIS Product ID`;
- `Product` string comme variante possible;
- les anciens objets `product.id`, `product.productID`, etc. restent supportes.

## Diagnostic Render

Le log `request` inclut maintenant :

- `productType`;
- `productPreview`.

Si `productType` vaut `string`, `productPreview` doit contenir le debut du `MIS Product ID`.

## Tests automatises

```text
npm run test:sprint43
npm run build
```
