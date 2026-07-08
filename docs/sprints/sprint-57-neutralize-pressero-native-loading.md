# Sprint 57 - Neutralize Pressero Native Loading

## Objectif

Ameliorer l'experience utilisateur du configurateur visuel Pressero/PJM.

Apres un choix image, Pressero peut afficher tres brievement son effet natif de recalcul : overlay gris, barre de chargement bleue, puis scroll vers le vrai champ du calculateur natif. Ce comportement est perturbant parce que l'utilisateur travaille dans l'interface image, pas dans les listes deroulantes natives.

## Correction

Le script public conserve la logique V22.1 :

- les vrais champs Pressero/PJM restent dans le DOM;
- le choix image modifie le vrai `select`;
- un seul evenement `change` natif est declenche;
- Pressero/PJM reste responsable du recalcul et du prix.

Le runtime ajoute maintenant une couche UX :

- le bloc visuel est place avant le conteneur natif de pricing quand c'est possible, afin d'eviter d'etre grise avec le calculateur Pressero;
- les overlays et loaders connus de Pressero/Kendo sont neutralises pendant une courte fenetre de recalcul;
- la position de scroll utilisateur est restauree apres le `change`, puis quelques fois pendant le recalcul.

## Resultat attendu

L'utilisateur clique une image, le vrai moteur Pressero/PJM recalcule toujours, mais l'interface ne saute plus vers le champ masque et ne montre plus l'overlay natif dans le configurateur visuel.

## Test automatise

```bash
npm run test:sprint57
```
