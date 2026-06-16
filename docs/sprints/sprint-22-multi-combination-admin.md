# Sprint 22 - Multi-Combination Admin

## Objectif

Ajouter un premier flux admin pour creer un MIS ID rattache a plusieurs combinaisons validees.

Le flux reste volontairement strict:

- chaque combinaison est creee depuis le flux PJM progressif existant;
- chaque combinaison doit avoir ses paliers PJM calcules;
- chaque palier doit avoir un prix negocie;
- toutes les combinaisons d'un meme MIS ID doivent partager la meme organisation, le meme moteur PJM et le meme groupe de prix.

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
- `scripts/test-sprint-22-multi-combination-admin.mjs`
- `package.json`

## Endpoint ajoute

```http
POST /negotiated-prices/multi-save
```

Le payload contient le contexte du profil et une liste de combinaisons, chacune avec ses options et ses paliers negocies.

Le endpoint cree:

- un `NegotiatedPriceProfile` en mode `multi`;
- plusieurs `NegotiatedPriceCombination`;
- plusieurs `NegotiatedPriceTier` par combinaison;
- les anciennes lignes `NegotiatedPriceCombinationSet` pour compatibilite transitoire.

## Interface admin

L'ecran `Prix negocies` ajoute:

- `Type MIS ID`: combinaison unique ou multi-combinaison;
- `Options cote client`: masquees ou selectionnables;
- bouton `Ajouter combinaison`;
- liste `Combinaisons MIS ID`;
- bouton `Creer multi-combinaison`.

## Incompatibilites

Le sprint ne reconstruit pas les regles PJM.

Le principe reste:

```text
PJM valide les choix pendant la creation admin.
Le middleware enregistre uniquement les combinaisons deja validees.
Le futur web-to-print naviguera dans cette liste blanche.
```

## Tests automatises

```bash
npm run test:sprint22
```

Le test verifie:

- le endpoint `multi-save`;
- les types multi-combinaison;
- le stockage `Profile -> Combination -> Tier`;
- les controles admin visibles;
- la logique de panier multi-combinaison;
- la reference V22.1 intacte.

## Resultat attendu

L'admin peut preparer plusieurs combinaisons et les sauvegarder sous un seul MIS ID global. Le comportement web-to-print final sera ajoute dans un sprint dedie.
