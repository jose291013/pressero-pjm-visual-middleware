# Sprint 60 - Native Scroll Jump Guard

## Objectif

Supprimer le dernier petit sursaut visible quand Pressero reconstruit son calculateur natif apres un choix visuel ou une modification de quantite.

## Comportement

- Les champs natifs transformes en choix visuels restent dans le DOM, mais leur ligne native est masquee avec `display:none`.
- Le configurateur visuel et les conteneurs de pricing Pressero desactivent `overflow-anchor` pour eviter que le navigateur recale automatiquement la page pendant le recalcul.
- Lorsqu'un champ natif Pressero change, le runtime memorise la position de scroll courante au moment exact du changement.
- Pendant la courte phase de recalcul Pressero, le runtime restaure plusieurs fois cette position afin d'annuler les scrolls automatiques tardifs.

## Contrat V22.1

Le runtime continue de modifier les vrais champs Pressero/PJM et de declencher un seul `change` natif. Les prix, incompatibilites et validations restent geres par Pressero/PJM.
