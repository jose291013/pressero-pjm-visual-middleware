# Sprint 21 - Negotiated Profile Identity

## Objectif

Poser la cle metier des prix negocies avant d'ajouter le mode multi-combinaison.

La reference fonctionnelle complete devient:

```text
Organisation + moteur de prix + MISID
```

Le MISID n'est donc pas une reference globale isolee. Il appartient au contexte d'une organisation Pressero/PJM et d'un moteur de prix PJM.

## Fichiers modifies

- `prisma/schema.prisma`
- `src/modules/negotiated-prices/negotiatedPrices.types.ts`
- `src/modules/negotiated-prices/negotiatedPrices.service.ts`
- `docs/architecture/admin-api.md`
- `docs/architecture/negotiated-prices-excel-model.md`
- `scripts/test-sprint-21-negotiated-profile-identity.mjs`
- `package.json`

## Modele Prisma

`NegotiatedPriceProfile` porte maintenant les champs structurants:

- `organizationIntegrationId`
- `priceEngineId`
- `misId`
- `enginePriceGroupIntegrationId`
- `profileMode`: `single` ou `multi`
- `visibilityMode`: `hidden` ou `selectable`

Un index compose prepare la recherche sure:

```text
organizationIntegrationId + priceEngineId + misId
```

La contrainte unique stricte sera ajoutee dans un sprint de migration dedie, apres audit/backfill des anciens profils deja crees. Cela evite de forcer un `db push --accept-data-loss` sur une base qui contient deja des donnees.

Deux nouveaux modeles preparent le stockage cible:

- `NegotiatedPriceCombination`
- `NegotiatedPriceTier`

Cela permet le modele:

```text
Profile -> Combination -> Tier
```

L'ancien modele `NegotiatedPriceCombinationSet` reste en place pour compatibilite avec les sprints precedents.

## Logique appliquee maintenant

Le flux direct actuel reste un mode `single`.

Lors de `POST /negotiated-prices/direct-save`, le service cree maintenant:

- un profil avec la cle `Organisation + moteur de prix + MISID`;
- une combinaison par defaut;
- plusieurs paliers rattaches a cette combinaison;
- les anciennes lignes `NegotiatedPriceCombinationSet` pour compatibilite transitoire.

## Preparation multi-combinaison

Le prochain sprint pourra ajouter une action admin `Ajouter cette combinaison` puis `Creer multi-combinaison`.

Chaque combinaison ajoutee devra etre deja validee par le flux PJM progressif avant d'etre rattachee au meme profil.

## Tests automatises

```bash
npm run test:sprint21
```

Le test verifie:

- la cle metier dans Prisma;
- les modes `single/multi` et `hidden/selectable`;
- le nouveau modele `Profile -> Combination -> Tier`;
- l'ecriture de la cle metier par le service d'enregistrement direct;
- la reference V22.1 intacte.

## Resultat attendu

Le systeme peut continuer a creer un MISID pour une combinaison unique, mais ce MISID est maintenant stocke dans un contexte exploitable pour les futures configurations multi-combinaisons et pour les appels Pressero.
