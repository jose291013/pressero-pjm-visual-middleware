# Sprint 26 - Pressero Product Configs

## Objectif

Creer la base de configuration qui relie le champ `MIS Product ID` de Pressero au middleware.

Le `MIS Product ID` Pressero devient la cle d'entree produit cote middleware. Il peut pointer vers deux modes:

- `PJM standard`, sans prix negocie;
- `Prix negocie`, rattache a un MISID negocie existant.

La bibliotheque d'images et les mappings visuels seront communs aux deux modes dans les sprints suivants.

## Modele Prisma

Ajout:

```text
PresseroProductConfig
```

Champs principaux:

- `misProductId`;
- `pricingMode`;
- `organizationIntegrationId`;
- `priceEngineId`;
- `enginePriceGroupIntegrationId`;
- `negotiatedProfileId` optionnel.

## Endpoints ajoutes

```http
GET /pressero-config
GET /pressero-config/admin/product-configs
POST /pressero-config/admin/product-configs
PUT /pressero-config/admin/product-configs/:configId
DELETE /pressero-config/admin/product-configs/:configId
```

## Interface admin

Ajout d'une vue `Produits Pressero`.

L'administrateur peut:

- creer un `MIS Product ID`;
- choisir l'organisation;
- choisir le moteur PJM;
- choisir le groupe de prix;
- choisir le mode `PJM standard` ou `Prix negocie`;
- rattacher un MISID negocie lorsque le mode l'exige;
- modifier ou supprimer une configuration active.

## Validation

Le backend verifie que:

- le groupe de prix appartient au moteur PJM choisi;
- en mode prix negocie, le MISID existe et correspond a la meme organisation, au meme moteur et au meme groupe.

## Tests automatises

```bash
npm run test:sprint26
```

Le test verifie le modele Prisma, le module backend, les routes, la vue admin et la reference V22.1.

## Resultat attendu

Pressero pourra utiliser son champ `MIS Product ID` pour appeler une configuration middleware unique, qu'elle soit en PJM standard ou en prix negocie.
