# Sprint 25 - Edit Delete Negotiated Profiles

## Objectif

Permettre a l'administrateur de gerer les MIS ID deja crees depuis le panneau `MIS ID existants`.

Une fois le contexte choisi:

```text
Organisation + moteur PJM + groupe de prix
```

l'administrateur peut modifier les prix negocies d'un MIS ID existant ou le supprimer.

## Fichiers modifies

- `src/modules/negotiated-prices/negotiatedPrices.types.ts`
- `src/modules/negotiated-prices/negotiatedPrices.service.ts`
- `src/modules/negotiated-prices/negotiatedPrices.controller.ts`
- `src/modules/negotiated-prices/negotiatedPrices.routes.ts`
- `src/public/admin/admin.css`
- `src/public/admin/admin.js`
- `docs/architecture/admin-api.md`
- `docs/architecture/negotiated-prices-excel-model.md`
- `scripts/test-sprint-25-edit-delete-negotiated-profiles.mjs`
- `package.json`

## Endpoints ajoutes

```http
PUT /negotiated-prices/profiles/:profileId
DELETE /negotiated-prices/profiles/:profileId
```

`PUT` met a jour:

- la visibilite cote client;
- les prix negocies des paliers existants.

`DELETE` effectue une suppression logique:

- `NegotiatedPriceProfile.isActive = false`;
- les combinaisons rattachees passent au statut `deleted`.

Les donnees ne sont pas effacees physiquement afin d'eviter une perte d'historique brutale.

## Interface admin

Chaque carte de MIS ID existant propose:

- `Modifier`;
- `Supprimer`.

Le mode edition affiche les paliers existants avec le prix PJM en lecture seule et le prix negocie modifiable.

## Tests automatises

```bash
npm run test:sprint25
```

Le test verifie les nouveaux types, services, routes, actions UI, styles, documentation et la reference V22.1.

## Resultat attendu

L'administrateur peut corriger un prix negocie sans creer un nouveau MIS ID et peut retirer un MIS ID actif lorsqu'il ne doit plus etre propose.
