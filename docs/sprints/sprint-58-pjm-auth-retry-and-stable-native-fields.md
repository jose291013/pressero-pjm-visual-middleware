# Sprint 58 - PJM Auth Retry And Stable Native Fields

## Objectif

Corriger deux effets constates dans Pressero apres optimisation du runtime visuel :

- PJM peut retourner `401` lorsque le token garde en memoire par le middleware n'est plus accepte;
- pendant les rerenders natifs Pressero, les listes deroulantes originales peuvent reapparaitre un instant avant que le runtime visuel ne les masque a nouveau, ce qui cree un clignotement visible.

## Correction PJM

Le client PJM retente maintenant automatiquement une requete authentifiee apres un `401`.

Le flux est :

1. utiliser le token en cache;
2. si PJM retourne `401`, forcer `authenticate(true)`;
3. rejouer une seule fois la requete avec le nouveau token.

Cela evite de devoir modifier le backoffice quand seul le token PJM est expire ou invalide.

## Correction Pressero

Le runtime visuel memorise les selectors des vrais champs natifs qu'il transforme en images. Il maintient ensuite une feuille CSS dynamique pour masquer ces champs immediatement, meme si Pressero reconstruit le DOM.

Le delai de rerender passe aussi de 250 ms a 40 ms et le scroll est stabilise sur les changements natifs du calculateur, y compris la quantite d'exemplaires.

## Resultat attendu

- plus de `401` persistant si les identifiants PJM sont encore valides;
- les listes deroulantes natives ne doivent plus clignoter entre deux rendus visuels;
- Pressero/PJM continue de gerer le recalcul reel;
- le scroll utilisateur reste stable pendant le recalcul.

## Test automatise

```bash
npm run test:sprint58
```
