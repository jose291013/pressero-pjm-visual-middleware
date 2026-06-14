# Sprint 4 - PJM Client

## Objectif

Creer un client PJM isole, injectable et testable, sans lancer de synchronisation automatique.

Le client prepare les appels necessaires pour le prochain sprint :

- authentification PJM ;
- liste moteurs/groupes ;
- options moteur ;
- options et prix.

## Fichiers modifies ou ajoutes

- `package.json`
- `src/config/env.ts`
- `src/modules/pjm-sync/pjmClient.ts`
- `docs/architecture/pjm-endpoints.md`
- `docs/architecture/pjm-sync-model.md`
- `docs/sprints/sprint-4-pjm-client.md`
- `scripts/test-sprint-4-pjm-client.mjs`

## Endpoints ajoutes

Aucun endpoint interne n'est ajoute dans ce sprint.

## Modeles Prisma ajoutes ou modifies

Aucun modele Prisma n'est ajoute ou modifie dans ce sprint.

## Tests automatises

```bash
npm run test:sprint4
npm run dev:check
```

Le test verifie que le client :

- reste dans le module `pjm-sync` ;
- utilise les types de contrats du Sprint 3 ;
- construit les payloads `options` et `optionsandprice` ;
- utilise `POST` et `Authorization: Bearer`;
- accepte un `fetchImpl` injectable ;
- ne fait pas d'appel PJM au demarrage.

## Resultat attendu

Le middleware dispose d'une frontiere reseau PJM claire. Le prochain sprint pourra creer une synchronisation explicite qui appelle le client, normalise les reponses et persiste les donnees avec Prisma.
