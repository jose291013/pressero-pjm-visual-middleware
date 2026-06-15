# Sprint 20 - Direct Save Feedback

## Objectif

Rendre l'enregistrement direct des prix negocies explicite pour l'administrateur.

Apres un clic sur `Enregistrer`, l'interface doit afficher le MISID genere dans une zone visible. Si le backend ne retourne pas de MISID, l'interface doit afficher une erreur claire au lieu de laisser croire que l'action a reussi.

## Fichiers modifies

- `src/public/admin/index.html`
- `src/public/admin/admin.css`
- `src/public/admin/admin.js`
- `docs/architecture/admin-api.md`
- `docs/architecture/negotiated-prices-excel-model.md`
- `scripts/test-sprint-20-direct-save-feedback.mjs`
- `package.json`

## Endpoints ajoutes

Aucun endpoint ajoute. Le sprint renforce le retour visuel autour de:

```http
POST /negotiated-prices/direct-save
```

## Tests automatises

```bash
npm run test:sprint20
```

Le test verifie que:

- le conteneur du MISID est visible avant les boutons d'action;
- le style de succes et le style d'erreur existent;
- le JavaScript refuse un enregistrement sans MISID retourne;
- les erreurs d'enregistrement s'affichent sans effacer les prix saisis;
- la reference V22.1 reste presente et non modifiee.

## Resultat attendu

L'administrateur voit immediatement la reference `MISID` apres l'enregistrement. En cas d'erreur, le message reste dans le panneau `Prix directs` et les valeurs deja saisies restent visibles.
