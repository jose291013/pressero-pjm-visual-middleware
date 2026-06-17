# Sprint 28 - Pressero Org Search Dedupe

## Objectif

Ameliorer la creation des configurations `MIS Product ID price 1`.

Deux corrections:

- choisir l'organisation par son nom visible avec recherche;
- eviter les doublons dans la liste des grilles de prix negociees internes.

## Interface admin

Dans `Produits Pressero`:

- le champ `Organisation` utilise une liste recherchable;
- le champ `Organisation ID` est en lecture seule;
- selectionner une organisation remplit automatiquement son ID.

## Grilles negociees

Le chargement des grilles negociees internes est protege contre les appels asynchrones concurrents.

La liste est aussi dedupliquee par identifiant de profil avant d'etre affichee.

## Tests automatises

```bash
npm run test:sprint28
```

Le test verifie le datalist organisation, l'ID readonly, la synchronisation front, le dedoublonnage des grilles negociees et la reference V22.1.

## Resultat attendu

L'administrateur choisit une organisation lisible, sans copier manuellement l'ID. Une grille negociee existante n'apparait qu'une seule fois dans le select.
