# Sprint 46 - Pressero re-render and minimum quantity

## Objectif

Corriger deux problemes observes dans Pressero :

- les visuels apparaissaient puis disparaissaient quand Pressero reconstruisait son bloc d'options ;
- PJM retournait une erreur quand la quantite externe Pressero etait inferieure au minimum attendu par le vrai parametre PJM.

## Runtime visuel

Le script `visual-configurator.js` observe maintenant les changements du DOM Pressero avec un `MutationObserver` attache uniquement a `document.body`.

Lorsque Pressero remplace ses champs, le script re-rend l'interface visuelle avec un debounce court. La protection `isRendering` evite une boucle de rendu causee par nos propres modifications DOM.

## Quantite minimale PJM

Lorsque PJM retourne un message du type :

```text
Quantite d'exemplaires must be between 25 and 999999 with 0 decimal places.
```

le middleware lit la quantite minimale (`25`) et retente une fois l'appel `optionsandprice` avec cette valeur si la quantite Pressero recue est inferieure.

Cette logique evite de bloquer le test produit sur une valeur generique Pressero initialisee a `1`, tout en laissant PJM rester la source des regles et du prix.

## Test automatise

```bash
npm run test:sprint46
```

## Resultat attendu

- les boutons images restent visibles apres les refreshs internes de Pressero ;
- les erreurs PJM de quantite minimale ne renvoient plus automatiquement une reponse diagnostic a `0` ;
- le calcul peut retourner `source: "pjmLive"` apres retry.
