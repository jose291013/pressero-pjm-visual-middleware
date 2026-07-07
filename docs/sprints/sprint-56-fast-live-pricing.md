# Sprint 56 - Fast Live Pricing

## Objectif

Ramener le temps de reponse du calcul Pressero sous moins de 2 secondes dans le cas standard, sans casser la gestion des incompatibilites PJM.

Le probleme venait du fait que le calcul de prix refaisait le parcours progressif complet des options avant chaque `optionsandprice`. Ce parcours est utile comme fallback de securite, mais trop couteux pour chaque changement utilisateur.

## Correction

Le prix PJM standard utilise maintenant un chemin rapide :

1. lire les vrais couples `{ Key, Value }` envoyes par Pressero;
2. appeler directement PJM `optionsandprice`;
3. retourner le prix si PJM accepte la configuration;
4. revenir au parcours progressif uniquement si PJM rejette ou ne renvoie pas de prix exploitable.

Les appels PJM repetes pendant les recalculs Pressero sont proteges par un cache court en memoire :

- cache `options`;
- cache `optionsandprice`;
- TTL volontairement court pour ne pas figer les donnees PJM.

Le client PJM cree depuis l'environnement est aussi reutilise en singleton afin de conserver le token d'authentification PJM entre deux requetes Render.

## Resultat attendu

- le prix courant ne doit plus refaire toute la resolution progressive;
- les appels identiques rapproches sont deduplices;
- les incompatibilites restent pilotees par PJM;
- le fallback progressif reste disponible pour les cas invalides ou ambigus.

## Test automatise

```bash
npm run test:sprint56
```
