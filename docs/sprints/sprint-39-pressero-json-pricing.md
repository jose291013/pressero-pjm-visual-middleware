# Sprint 39 - Pressero JSON Pricing Diagnostic

## Objectif

Ajouter le premier endpoint fixe que le moteur externe Pressero peut appeler en mode JSON.

Ce sprint ne branche pas encore PJM ni les prix negocies. Il sert a valider :

- l'URL appelee par Pressero ;
- la methode HTTP ;
- le payload envoye par Pressero ;
- le format JSON accepte par Pressero.

## Endpoint ajoute

```text
POST /pressero-pricing/json
```

URL Render attendue dans le moteur externe Pressero :

```text
https://pressero-pjm-visual-middleware.onrender.com/pressero-pricing/json
```

## Payload observe cote navigateur

Pressero envoie au minimum une quantite dans `pricingParameters.Q1` :

```json
{
  "pricingParameters": {
    "Q1": "1",
    "hdnTotalCost": "0",
    "hdnTotalWeight": "0",
    "KitParameters": null
  }
}
```

Le MIS Product ID est saisi au niveau du produit Pressero. Il n'est pas visible dans cet appel navigateur interne, mais il devrait etre transmis par Pressero lors de l'appel serveur au moteur externe.

## Reponse diagnostic

La route retourne un prix fixe calcule ainsi :

```text
prix = Q1 * 12.34
```

La reponse expose plusieurs alias de prix pour identifier le format que Pressero accepte :

```json
{
  "Price": 12.34,
  "Cost": 0,
  "Weight": 0,
  "TotalPrice": 12.34,
  "TotalCost": 0,
  "TotalWeight": 0,
  "price": 12.34,
  "cost": 0,
  "weight": 0,
  "success": true
}
```

Un mode debug existe pour les tests manuels :

```text
POST /pressero-pricing/json?debug=1
```

## Suite prevue

Une fois que Pressero accepte le format de reponse, le sprint suivant devra :

- valider l'authentification User / Access Token ;
- extraire le MIS Product ID transmis par Pressero ;
- charger la `PresseroProductConfig` ;
- appeler PJM `optionsandprice` pour le mode standard ;
- resoudre les paliers negocies pour le mode negocie.

## Tests automatises

```text
npm run test:sprint39
```
