# Sprint 61 - Native Scroll Hold And Stale Render Guard

## Objectif

Supprimer le scroll automatique restant lorsque Pressero reprend le focus sur un champ natif, en particulier apres un changement de quantite.

## Comportement

- Le runtime memorise la position de scroll des le clic ou le focus sur un vrai champ Pressero/PJM.
- Une courte garde de scroll reste active pendant le recalcul Pressero.
- Pendant cette garde, le `change` natif ne peut pas remplacer la position sauvegardee par une mauvaise position deja deplacee par Pressero.
- Les evenements `scroll` tardifs sont annules par une restauration immediate.
- Lors d'un rerender transitoire ou Pressero n'a pas encore reconstruit ses champs natifs, l'ancienne interface visuelle reste affichee au lieu d'etre videe.

## Contrat V22.1

Les champs Pressero/PJM restent les vraies sources. Le script ne cree pas de faux champs de quantite et continue de declencher un seul `change` natif sur les options visuelles.
