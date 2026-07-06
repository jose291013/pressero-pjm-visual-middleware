# Sprint 46 - Pressero re-render and minimum quantity

## Objectif

Corriger deux problemes observes dans Pressero :

- les visuels apparaissaient puis disparaissaient quand Pressero reconstruisait son bloc d'options ;
- PJM retournait une erreur quand la quantite externe Pressero etait inferieure au minimum attendu par le vrai parametre PJM.

## Runtime visuel

Le script `visual-configurator.js` observe maintenant les changements du DOM Pressero avec un `MutationObserver` attache uniquement a `document.body`.

Lorsque Pressero remplace ses champs, le script re-rend l'interface visuelle avec un debounce court. La protection `isRendering` evite une boucle de rendu causee par nos propres modifications DOM.

## Quantite minimale PJM

Ce sprint avait introduit un retry automatique sur la quantite minimale PJM. Cette logique a ete abandonnee au Sprint 50, car elle remplacait trop fortement le comportement natif PJM/Pressero.

Depuis le Sprint 50, le provider suit le flux du `saas-orchestrator` :

- conserver les couples `{ Key, Value }` envoyes par Pressero ;
- appeler PJM en `options` pour obtenir les options encore compatibles ;
- appeler PJM en `optionsandprice` avec les valeurs compatibles.

## Test automatise

```bash
npm run test:sprint46
```

## Resultat attendu

- les boutons images restent visibles apres les refreshs internes de Pressero ;
- la correction visuelle reste active ;
- le traitement des quantites et incompatibilites est delegue au flux PJM du Sprint 50.
