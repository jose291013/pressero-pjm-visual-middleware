# Sprint 30 - Pressero Negotiated Without Group

## Objectif

Simplifier le rattachement d'une grille negociee a un produit Pressero.

Le groupe de prix PJM reste obligatoire pour le mode `PJM standard`, car il determine le couple moteur/groupe utilise pour calculer les prix PJM. En mode `Prix negocie`, l'administrateur ne doit pas avoir a connaitre le groupe utilise lors du calcul de reference : il choisit seulement l'organisation, le moteur PJM et le MIS ID negocie.

## Changements

- la recherche des MIS ID negocies peut se faire avec organisation + moteur PJM, sans groupe;
- le groupe PJM de reference est derive depuis la grille negociee selectionnee;
- le champ groupe de prix est desactive dans `Produits Pressero` quand le mode est `Prix negocie`;
- le groupe de prix reste requis en `PJM standard`;
- les profils negocies exposent leur groupe de reference dans la reponse API pour conserver la trace technique.

## Fichiers modifies

- `src/modules/negotiated-prices/negotiatedPrices.service.ts`
- `src/modules/negotiated-prices/negotiatedPrices.types.ts`
- `src/modules/pressero-config/presseroConfig.service.ts`
- `src/modules/pressero-config/presseroConfig.types.ts`
- `src/public/admin/index.html`
- `src/public/admin/admin.js`
- `src/public/admin/admin.css`
- `docs/architecture/middleware-overview.md`
- `package.json`

## Test automatise

```bash
npm run test:sprint30
```

## Resultat attendu

Dans `Produits Pressero`, le mode `Prix negocie` charge les grilles disponibles sans demander de groupe de prix. Dans le mode `PJM standard`, le groupe de prix reste necessaire.
