# Sprint 23 - Negotiated Preview Scroll

## Objectif

Corriger le scroll de la colonne droite de l'ecran `Prix negocies`.

Depuis l'ajout des prix directs et des combinaisons MIS ID, le panneau `Preview Excel` peut contenir plus d'elements que la hauteur visible. La colonne droite doit donc scroller entierement.

## Fichiers modifies

- `src/public/admin/admin.css`
- `scripts/test-sprint-23-negotiated-preview-scroll.mjs`
- `package.json`

## Changement

Le panneau `.negotiated-preview-panel` devient une zone scrollable:

```css
overflow-y: auto;
overflow-x: hidden;
```

La zone `.preview-columns` ne cree plus un scroll interne dans ce panneau. Elle laisse le panneau parent gerer le scroll global de la colonne droite.

## Tests automatises

```bash
npm run test:sprint23
```

Le test verifie que le panneau de preview est scrollable et que la reference V22.1 reste intacte.

## Resultat attendu

L'administrateur peut scroller toute la partie droite: preview, prix directs, MIS ID et liste des combinaisons.
