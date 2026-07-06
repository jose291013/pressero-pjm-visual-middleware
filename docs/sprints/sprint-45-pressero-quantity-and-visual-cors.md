# Sprint 45 - Pressero quantity and visual CORS

## Objectif

Corriger deux ecarts observes dans Pressero apres le Sprint 44 :

- le script visuel ne pouvait pas toujours charger la configuration publique depuis le domaine Pressero ;
- le calcul PJM live pouvait recevoir une quantite vide ou native a `0` au lieu du vrai parametre PJM de quantite.

## Corrections

### CORS public Pressero

Le middleware ajoute maintenant les en-tetes CORS pour :

- `/public/pressero/...`
- `/pressero-config/public/...`

Cela permet au script charge dans Pressero de recuperer le JSON visuel depuis Render.

### Mapping visuel plus tolerant

La configuration visuelle expose maintenant `valueAliases` pour chaque choix :

- valeur PJM ;
- ID PJM ;
- libelle ;
- nom normalise.

Le script `visual-configurator.js` utilise ces alias pour retrouver la vraie valeur du `select` Pressero et stocke cette valeur dans `data-native-value`.

### Quantite PJM

Le provider JSON reconstruit les valeurs PJM depuis le modele synchronise.

Ce sprint avait d'abord force la quantite Pressero dans le vrai parametre PJM. Cette logique a ete remplacee au Sprint 50 : le middleware conserve maintenant les couples `{ Key, Value }` recus par Pressero, rafraichit les options PJM avec `options`, puis appelle `optionsandprice` avec les valeurs compatibles.

La quantite PJM native n'est donc plus remplacee par le champ generique `Quantity`.

## Fichiers modifies

- `src/app.ts`
- `src/modules/pressero-config/presseroConfig.service.ts`
- `src/modules/pressero-config/presseroConfig.types.ts`
- `src/modules/pressero-pricing/presseroPricing.service.ts`
- `src/public/pressero/visual-configurator.js`
- `scripts/test-sprint-45-pressero-quantity-and-visual-cors.mjs`
- `package.json`

## Test automatise

```bash
npm run test:sprint45
```

## Resultat attendu

Dans Pressero :

- les images peuvent charger la configuration publique depuis Render ;
- les boutons images pilotent les vrais `select` Pressero ;
- le prix live PJM recoit les vrais couples `{ Key, Value }` Pressero/PJM sans injection de quantite generique.
