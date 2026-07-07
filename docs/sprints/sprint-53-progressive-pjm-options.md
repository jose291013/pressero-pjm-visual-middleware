# Sprint 53 - Progressive PJM options

## Objectif

Aligner les compatibilites Pressero avec le flux du `saas-orchestrator`.

Le Sprint 51 appelait PJM `options` avec toutes les selections courantes en une seule fois. Cela permettait au prix de fonctionner, mais ne suffisait pas toujours a retirer les choix incompatibles de l'interface Pressero.

## Correction

Le middleware simule maintenant le chemin progressif du wizard PJM :

1. appeler PJM `options` sans selection pour connaitre l'ordre du moteur ;
2. parcourir les options dans cet ordre ;
3. pour chaque option, appeler PJM avec les `acceptedValues` deja valides ;
4. ne conserver la selection courante que si elle existe encore dans les choix compatibles ;
5. construire la liste Pressero depuis les options compatibles progressives ;
6. appeler `optionsandprice` avec les memes valeurs acceptees.

Le prix et la liste des options visibles utilisent donc le meme chemin PJM.

## Diagnostic

Les logs `pjm-live-flow` exposent maintenant :

- `mode: "progressive-options-then-optionsandprice"`;
- `progressiveRequestCount`;
- `initialValues`;
- `sanitizedValues`.

Un log `pjm-progressive-options` resume aussi le nombre d'options, de choix et de valeurs acceptees.

## Resultat attendu

Si un choix devient incompatible apres une selection precedente, il ne doit plus apparaitre dans Pressero, et il ne doit pas etre envoye a `optionsandprice`.

## Test automatise

```bash
npm run test:sprint53
```
