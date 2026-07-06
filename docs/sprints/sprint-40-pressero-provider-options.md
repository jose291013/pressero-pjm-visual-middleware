# Sprint 40 - Pressero Provider Options

## Objectif

Faire evoluer le diagnostic JSON Pressero en provider capable de repondre aux deux besoins du moteur externe Pressero :

- `GetOptionsForProduct` : retourner les options disponibles pour le `MIS Product ID`;
- `GetPriceForProduct` : retourner un prix au format deja valide par Pressero.

L'URL du plugin Pressero reste unique :

```text
https://pressero-pjm-visual-middleware.onrender.com/pressero-pricing/json
```

Le champ `MIS Product ID` saisi sur le produit Pressero sert de `productID` cote service externe. Il permet au middleware de retrouver la `PresseroProductConfig`.

## Reponse options

Le provider retourne le format `PricingParameter` documente par Pressero :

```json
[
  {
    "ID": "pjm-option-id",
    "Label": "Papier",
    "Options": [
      {
        "Key": "Couche brillant 135 gr",
        "Value": "pjm-choice-value"
      }
    ]
  }
]
```

Les options sont construites depuis le moteur PJM rattache au `MIS Product ID`. Pour le moment, seules les choices actives avec mapping image actif sont exposees afin de rester coherent avec l'objectif visuel du middleware.

## Endpoints compatibles

```text
GET  /pressero-pricing/json
POST /pressero-pricing/json
GET  /pressero-pricing/json/GetOptionsForProduct
POST /pressero-pricing/json/GetOptionsForProduct
GET  /pressero-pricing/json/GetPriceForProduct
POST /pressero-pricing/json/GetPriceForProduct
```

Ces alias couvrent les deux comportements possibles :

- Pressero appelle directement l'URL de base avec un payload JSON;
- Pressero ajoute un nom de methode proche du modele `.asmx`.

## Prix

Le calcul de prix reste diagnostic dans ce sprint :

```text
prix = quantite * 12.34
```

La prochaine etape sera de remplacer ce prix diagnostic par :

- un appel PJM `options and price` pour le mode standard;
- une resolution de palier negocie pour le mode negotiated.

## Tests automatises

```text
npm run test:sprint40
npm run build
```
