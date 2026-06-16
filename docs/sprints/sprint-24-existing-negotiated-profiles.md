# Sprint 24 - Existing Negotiated Profiles

## Objectif

Afficher les MIS ID deja enregistres pour le contexte de travail courant:

```text
Organisation + moteur PJM + groupe de prix
```

L'administrateur doit voir les combinaisons existantes avant de creer une nouvelle reference. Cela evite de reconstruire une combinaison deja sauvegardee sous un autre MIS ID.

## Fichiers modifies

- `src/modules/negotiated-prices/negotiatedPrices.types.ts`
- `src/modules/negotiated-prices/negotiatedPrices.service.ts`
- `src/modules/negotiated-prices/negotiatedPrices.controller.ts`
- `src/modules/negotiated-prices/negotiatedPrices.routes.ts`
- `src/public/admin/index.html`
- `src/public/admin/admin.css`
- `src/public/admin/admin.js`
- `docs/architecture/admin-api.md`
- `docs/architecture/negotiated-prices-excel-model.md`
- `scripts/test-sprint-24-existing-negotiated-profiles.mjs`
- `package.json`

## Changement

Un nouvel endpoint liste les profils negocies actifs deja rattaches au contexte:

```http
GET /negotiated-prices/profiles?clientId=...&priceEngineId=...&enginePriceGroupIntegrationId=...
```

La colonne droite de l'ecran `Prix negocies` contient maintenant un panneau `MIS ID existants`. Il se recharge lorsque l'organisation, le moteur ou le groupe de prix change, et apres une sauvegarde.

Les sauvegardes directes et multi-combinaisons refusent maintenant un doublon de combinaison dans le meme contexte. Le blocage utilise la cle de combinaison stable deja calculee par le backend.

## Tests automatises

```bash
npm run test:sprint24
```

Le test verifie l'endpoint de lecture, le garde-fou anti-doublon, le panneau admin, la documentation et la reference V22.1.

## Resultat attendu

Lorsque l'administrateur choisit une organisation, un moteur PJM et un groupe de prix, les MIS ID existants apparaissent dans le panneau de droite avec leurs combinaisons. Si une combinaison existe deja, l'interface ou l'API bloque la creation du doublon.
