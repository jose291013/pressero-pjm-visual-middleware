# Sprint 61 - Native Scroll Hold And Stale Render Guard

## Objectif

Supprimer le scroll automatique restant lorsque Pressero reprend le focus sur un champ natif, en particulier apres un changement de quantite.

Ce sprint a ensuite ete corrige par le Sprint 62, qui supprime le verrou de scroll agressif tout en conservant la garde contre les rerenders transitoires.

## Comportement

- Lors d'un rerender transitoire ou Pressero n'a pas encore reconstruit ses champs natifs, l'ancienne interface visuelle reste affichee au lieu d'etre videe.
- Le Sprint 62 supprime la garde de scroll forcee car elle empirait certains comportements Pressero.

## Contrat V22.1

Les champs Pressero/PJM restent les vraies sources. Le script ne cree pas de faux champs de quantite et continue de declencher un seul `change` natif sur les options visuelles.
