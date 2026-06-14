# Sprint 1 - Foundation

## Objectif

Creer la fondation du middleware `pressero-pjm-visual-middleware` sans modifier la logique Pressero V22.1 validee.

Le sprint pose uniquement :

- la configuration Node.js / TypeScript ;
- un serveur Express minimal ;
- l'endpoint `GET /health` ;
- la structure modulaire cible ;
- le schema Prisma initial ;
- un script de test automatise.

## Fichiers modifies ou ajoutes

- `package.json`
- `tsconfig.json`
- `.env.example`
- `README.md`
- `src/app.ts`
- `src/server.ts`
- `src/config/env.ts`
- `src/config/prisma.ts`
- `src/modules/health/*`
- `src/modules/pjm-sync/*`
- `src/modules/visual-options/*`
- `src/modules/media-library/*`
- `src/modules/pressero-config/*`
- `src/modules/negotiated-prices/*`
- `src/shared/*`
- `src/public/*`
- `prisma/schema.prisma`
- `scripts/test-sprint-1-foundation.mjs`
- `scripts/dev-check.mjs`

## Endpoints ajoutes

- `GET /health`

Les autres modules existent comme structure de code, mais ne sont pas branches dans `src/app.ts` au Sprint 1.

## Modeles Prisma ajoutes

- `PjmProductCategory`
- `PjmPriceGroup`
- `PjmPriceEngine`
- `PjmOption`
- `PjmOptionChoice`
- `MediaAsset`
- `VisualOptionMapping`
- `NegotiatedPriceProfile`
- `NegotiatedPriceCombinationSet`
- `NegotiatedPriceImportJob`

## Tests automatises

```bash
npm run test:sprint1
```

Le test verifie la presence de la structure cible, les scripts npm, l'endpoint health, les modeles Prisma et la reference V22.1.

## Resultat attendu

Le projet dispose d'une base propre, modulaire et extensible. Aucun connecteur PJM reel, import/export Excel ou front complexe n'est cree au Sprint 1.
