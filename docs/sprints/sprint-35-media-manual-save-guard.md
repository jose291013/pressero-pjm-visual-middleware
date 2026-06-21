# Sprint 35 - Media Manual Save Guard

## Objectif

Eviter la confusion entre l'import ZIP et la sauvegarde manuelle d'une image par URL.

Le bouton de sauvegarde du formulaire média concerne uniquement une image ajoutée ou modifiée avec une URL. Les images importées depuis un ZIP sont déjà enregistrées par l'endpoint d'import.

## Fichiers modifiés

- `src/public/admin/index.html`
- `src/public/admin/admin.js`
- `package.json`
- `scripts/test-sprint-35-media-manual-save-guard.mjs`
- `docs/sprints/sprint-35-media-manual-save-guard.md`

## Comportement ajouté

- Le bouton manuel est renommé `Enregistrer URL`.
- Si l'administrateur clique sur ce bouton sans URL et sans image en édition, l'interface affiche un message non bloquant.
- La liste `Images et icones` n'est plus remplacée par l'erreur `URL image obligatoire`.
- Les images importées par ZIP restent visibles après ce clic.

## Tests automatisés

Script ajouté :

```text
scripts/test-sprint-35-media-manual-save-guard.mjs
```

Commande :

```text
npm run test:sprint35
```

Le test vérifie que le bouton est explicite, que la garde JavaScript existe et que les erreurs de sauvegarde manuelle ne remplacent plus la liste des images.

## Résultat attendu

Après un import ZIP, l'administrateur n'a rien d'autre à enregistrer dans l'onglet `Images`. Il peut passer directement dans `Mappings` pour associer les images aux choix PJM.
