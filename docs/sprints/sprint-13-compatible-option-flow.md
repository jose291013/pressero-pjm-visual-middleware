# Sprint 13 - Compatible Option Flow

## Objectif

Faire piloter la selection des options de prix negocies par PJM afin de ne presenter que les options compatibles avec les choix deja faits.

## Contexte

L'ancien orchestrateur appelait PJM apres chaque selection avec:

```json
{
  "Operation": "options",
  "Product": "enginePriceGroupIntegrationId",
  "Options": [
    {
      "Key": "pjm-option-id",
      "Value": "pjm-choice-value"
    }
  ]
}
```

PJM renvoie alors une nouvelle liste d'options compatible avec les choix envoyes.

## Fichiers modifies

- `src/modules/pjm-sync/pjmContracts.types.ts`
- `src/modules/pjm-sync/pjmClient.ts`
- `src/modules/pjm-sync/pjmSyncCatalog.service.ts`
- `src/modules/negotiated-prices/negotiatedPrices.types.ts`
- `src/modules/negotiated-prices/negotiatedPrices.service.ts`
- `src/modules/negotiated-prices/negotiatedPrices.controller.ts`
- `src/modules/negotiated-prices/negotiatedPrices.routes.ts`
- `src/public/admin/admin.js`
- `docs/architecture/admin-api.md`
- `docs/architecture/negotiated-prices-excel-model.md`
- `docs/architecture/pjm-endpoints.md`
- `scripts/test-sprint-13-compatible-option-flow.mjs`
- `package.json`

## Endpoints ajoutes

```http
POST /negotiated-prices/compatible-options
```

Payload:

```json
{
  "enginePriceGroupIntegrationId": "mapping-id",
  "selections": [
    {
      "pjmKey": "option-id",
      "pjmValue": "choice-value"
    }
  ]
}
```

La route appelle PJM avec `Operation: "options"` et renvoie des options normalisees pour le backoffice.

## Modeles Prisma

Aucun modele Prisma modifie.

## Backoffice

Dans `Prix negocies`, les options ne sont plus affichees toutes en meme temps.

L'admin affiche:

- les options deja selectionnees;
- la prochaine option compatible renvoyee par PJM.

Apres chaque coche, le backoffice rappelle `/negotiated-prices/compatible-options`.

## Limite volontaire

Quand plusieurs choix sont coches pour une meme option, le flux de compatibilite utilise le premier choix coche comme chemin PJM pour decouvrir l'option suivante. Les choix visibles restent ceux qui seront envoyes a la preview Excel.

Un sprint suivant devra calculer les compatibilites branche par branche avant de remplir les prix PJM dans l'Excel.

## Tests automatises

```bash
npm run test:sprint13
npm run dev:check
```

## Resultat attendu

Le backoffice peut maintenant suivre les incompatibilites PJM pendant la preparation de l'Excel, au lieu de presenter uniquement la liste statique des options synchronisees.
