# Sprint 12 - Option Label Normalization

## Objectif

Corriger l'affichage des options PJM dans le backoffice pour montrer des choix lisibles au lieu des IDs techniques quand PJM fournit un libelle.

## Contexte

Les retours PJM d'options peuvent exposer les choix sous la forme:

```json
{
  "Key": "Papier couche 135 g",
  "Value": "f9560008-8eb6-4d44-b090-af35d1426c66"
}
```

Dans ce cas, `Key` est le libelle utilisateur et `Value` est la valeur technique a renvoyer a PJM.

## Fichiers modifies

- `src/modules/pjm-sync/pjmContracts.types.ts`
- `src/modules/pjm-sync/pjmSyncCatalog.service.ts`
- `docs/architecture/pjm-endpoints.md`
- `docs/architecture/admin-api.md`
- `scripts/test-sprint-12-option-label-normalization.mjs`
- `package.json`

## Endpoints ajoutes

Aucun endpoint ajoute.

## Modeles Prisma

Aucun modele Prisma modifie.

Les colonnes existantes restent suffisantes:

- `PjmOptionChoice.name` stocke le libelle lisible.
- `PjmOptionChoice.value` stocke la valeur technique PJM.

## Backoffice

Le backoffice continue d'afficher `choice.name` dans:

- le detail du moteur;
- l'ecran `Prix negocies`;
- la preview de selections envoyee au generateur Excel.

La liste deroulante des organisations devra venir plus tard des sites Pressero. Pour l'instant, le champ organisation de l'ecran prix negocies reste manuel afin de ne pas inventer une source de donnees Pressero.

## Tests automatises

```bash
npm run test:sprint12
npm run dev:check
```

## Resultat attendu

Apres le correctif, il faut relancer `Synchroniser PJM` pour que les choix deja stockes soient reecrits avec les libelles PJM.

Les choix doivent alors apparaitre comme des textes lisibles lorsque PJM renvoie `Key`, `Label`, `Text`, `DisplayName`, `Title`, `Description` ou `Name`. Les IDs restent conserves comme valeurs techniques quand ils sont necessaires aux appels PJM.
