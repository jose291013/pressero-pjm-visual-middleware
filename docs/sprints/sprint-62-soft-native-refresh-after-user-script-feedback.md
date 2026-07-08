# Sprint 62 - Soft Native Refresh After User Script Feedback

## Objectif

Revenir a une approche plus proche du script utilisateur qui fonctionne mieux dans Pressero, en supprimant le verrou de scroll agressif introduit au Sprint 61.

## Comportement

- Le runtime ne bloque plus le scroll global par intervalle.
- Les champs natifs transformes restent vivants et sont caches hors ecran lorsque le fallback direct est necessaire.
- Les lignes natives completes restent masquees avec `display:none` quand le navigateur supporte `:has`.
- Le rerender visuel attend maintenant 160 ms pour laisser Pressero reconstruire ses champs natifs avant de remapper les images.
- Le `MutationObserver` surveille en priorite la zone de pricing native au lieu de tout le `body`.
- Pendant le settle Pressero, le runtime reapplique seulement le masquage natif et les shields visuels, sans forcer la position de scroll.

## Pourquoi

Le verrou de scroll tentait de corriger le saut mais pouvait empirer l'experience en luttant contre Pressero. Le script utilisateur montre qu'une approche plus stable consiste a laisser le calculateur natif vivre, tout en cachant les champs transformes de facon discrete.
