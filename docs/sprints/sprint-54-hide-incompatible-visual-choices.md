# Sprint 54 - Hide incompatible visual choices

## Objectif

Faire disparaitre les choix visuels incompatibles dans Pressero.

Le JSON public `visual-config` reste volontairement statique : il contient toute la bibliotheque visuelle mappee pour le produit. Mais l'interface utilisateur ne doit afficher que les choix encore presents dans les vrais champs natifs Pressero/PJM.

## Correction backend

Le flux progressif PJM teste maintenant les choix candidats :

1. prendre les valeurs deja acceptees ;
2. ajouter temporairement un choix candidat ;
3. appeler PJM `options` ;
4. conserver le choix seulement si PJM le retourne encore comme valeur valide.

Ainsi, un choix que PJM rejetterait ou ignorerait ne doit plus etre renvoye comme disponible.

## Correction navigateur

`visual-configurator.js` filtre les boutons images avant affichage :

- il lit les `option` actuellement presentes dans le champ natif Pressero ;
- il compare ces valeurs avec les `valueAliases` du choix visuel ;
- il n'affiche le bouton image que si une correspondance native existe.

Si un groupe visuel n'a plus aucun choix compatible, il n'est pas rendu et le champ natif n'est pas masque.

## Resultat attendu

Apres avoir choisi un papier comme `135 gr`, si PJM retire les pelliculages incompatibles, les boutons `Mat` et `Soft touch` ne doivent plus apparaitre.

## Test automatise

```bash
npm run test:sprint54
```
