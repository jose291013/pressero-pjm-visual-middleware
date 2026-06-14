# Sprint 9 - Admin Catalog Organization

## Objectif

Rendre le backoffice catalogue PJM plus lisible apres une vraie synchronisation avec beaucoup de moteurs.

Le sprint reorganise l'ecran catalogue pour :

- limiter les KPI a `Moteurs`, `Groupes` et `Categories` ;
- filtrer les moteurs par recherche, categorie disponible, groupe de prix et organisation ;
- preparer le critere `Organisation` pour le futur couplage avec les prix negocies ;
- rendre la liste des moteurs et le detail moteur scrollables independamment.

L'inspection du retour `productEngines/list` montre que PJM renvoie `Total` et `Data`, puis des moteurs avec `Id`, `Name` et `Mappings`. Aucune categorie produit n'est fournie dans ce retour. Le backoffice utilise donc les categories deja presentes en base si elles existent, sans inventer de fausse categorie PJM.

## Fichiers modifies ou ajoutes

- `package.json`
- `src/modules/pjm-sync/pjmSync.types.ts`
- `src/modules/pjm-sync/pjmSyncAdmin.service.ts`
- `src/modules/pjm-sync/pjmSync.controller.ts`
- `src/modules/pjm-sync/pjmSync.routes.ts`
- `src/public/admin/index.html`
- `src/public/admin/admin.css`
- `src/public/admin/admin.js`
- `docs/architecture/admin-api.md`
- `docs/sprints/sprint-9-admin-catalog-organization.md`
- `scripts/test-sprint-9-admin-catalog-organization.mjs`

## Endpoints ajoutes

- `GET /pjm-sync/admin/organizations`

## Modeles Prisma ajoutes ou modifies

Aucun modele Prisma n'est ajoute ou modifie dans ce sprint.

Le critere organisation s'appuie en lecture seule sur `NegotiatedPriceProfile` pour preparer le lien futur avec les prix negocies.

## Tests automatises

```bash
npm run test:sprint9
npm run dev:check
```

Le test verifie :

- les trois KPI attendus ;
- le compteur `productCategories` dans le resume admin ;
- le filtre `Organisation` ;
- le filtre `Categorie` ;
- le filtre `Groupe` ;
- l'endpoint organisations ;
- le scroll independant des panneaux ;
- la preservation de la reference V22.1.

## Resultat attendu

Le backoffice reste utilisable avec plus de 100 moteurs synchronises. La liste de gauche peut defiler sans bloquer le detail moteur, et le detail de droite peut defiler sans devoir descendre toute la page.
