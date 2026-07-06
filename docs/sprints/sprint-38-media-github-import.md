# Sprint 38 - Media GitHub Import

## Objectif

Eviter la saisie manuelle des noms d'images lors de l'import Render Static.

L'administrateur indique :

- l'URL publique du Render Static Site ;
- le depot GitHub public contenant les images ;
- la branche ;
- le dossier a scanner.

Le middleware lit GitHub pour recuperer les noms de fichiers, puis cree les `MediaAsset` avec les URLs Render Static finales.

## Endpoint ajoute

```text
POST /media-library/admin/assets/import-github
```

Payload :

```json
{
  "baseUrl": "https://pjm-images-static.onrender.com/",
  "repository": "jose291013/pjm-images-static",
  "branch": "main",
  "directory": ""
}
```

Le depot GitHub doit etre public pour ce sprint. Aucun token GitHub n'est stocke par le middleware.

## Comportement

Le middleware appelle l'API GitHub Contents pour lister le dossier demande.

Il conserve uniquement les fichiers image supportes :

```text
.webp
.svg
.png
.jpg
.jpeg
```

Chaque fichier est ensuite importe comme dans le flux Render Static manuel :

```text
MediaAsset.key -> nom normalise
MediaAsset.url -> URL Render Static absolue
```

Les mappings existants restent stables car ils referencent `MediaAsset.id`.

## Interface admin

La page Images ajoute :

- depot GitHub ;
- branche ;
- dossier GitHub ;
- bouton `Scanner GitHub et importer`.

Le champ `Fichiers images` est mis a jour avec les fichiers importes pour donner un retour visuel a l'administrateur.

## Tests automatises

```text
npm run test:sprint38
```

Le test verifie le contrat de types, le service GitHub, la route, l'interface admin et cette documentation.
