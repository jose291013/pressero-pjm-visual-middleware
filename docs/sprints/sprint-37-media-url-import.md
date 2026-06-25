# Sprint 37 - Media URL Import

## Objectif

Permettre d'utiliser Render Static Files comme stockage public temporaire pour les images d'options, sans copier les fichiers dans le Web Service du middleware.

Le middleware stocke uniquement les metadonnees dans `MediaAsset` :

- cle normalisee ;
- nom de fichier ;
- type MIME ;
- URL absolue de l'image ;
- texte alternatif.

## Endpoints ajoutes

```text
POST /media-library/admin/assets/import-urls
```

Payload attendu :

```json
{
  "baseUrl": "https://mon-site-static.onrender.com/",
  "files": "couche-brillant-135-gr.webp\nstandard.webp"
}
```

`files` peut aussi etre un tableau de chaines.

## Comportement

Pour chaque fichier :

- le nom est valide ;
- l'extension doit etre une image supportee ;
- la cle interne est generee depuis le nom du fichier ;
- l'URL finale est construite avec l'URL de base Render ;
- l'image est creee ou mise a jour par `MediaAsset.key`.

Cela permet de relancer l'import sans casser les mappings existants.

## Interface admin

La page Images contient maintenant un bloc `Import Render Static` avec :

- URL de base du Static Site Render ;
- liste de fichiers, un par ligne ;
- bouton `Importer URLs`.

## Tests automatises

```text
npm run test:sprint37
```

Le test verifie :

- le contrat de types ;
- la route admin ;
- le service d'import URL ;
- les champs de l'interface admin ;
- la documentation du sprint.

## Resultat attendu

L'administrateur peut heberger les images dans un Render Static Site, puis importer leurs references dans le middleware pour les mapper aux choix PJM.
