# Sprint 44 - Pressero Price And Visual Runtime

## Objectif

Avancer en parallele sur les deux couches Pressero :

- le provider de prix externe;
- le script visuel client.

## Prix Pressero

Le provider `/pressero-pricing/json` ne retourne plus uniquement le diagnostic `12.34`.

Il lit le `MIS Product ID`, charge la `PresseroProductConfig`, puis choisit la source :

- `pjmLive` : appel PJM `optionsandprice` avec les options selectionnees;
- `negotiated` : recherche d'une combinaison negociee et interpolation entre paliers.

La reponse conserve la forme acceptee par Pressero :

```json
{
  "Price": 123.45,
  "TotalPrice": 123.45,
  "Weight": 0,
  "Options": [],
  "source": "pjmLive"
}
```

En cas d'erreur, le provider retourne `Error` et `Price: 0` afin d'eviter un mauvais prix silencieux.

## Quantite PJM

Pressero envoie une quantite separee. Pour PJM standard, le middleware ajoute cette quantite aux `engineValues` quand il trouve un parametre PJM dont le libelle ressemble a `quantity`, `quantite`, `exemplaire` ou `exemplaires`.

Cette heuristique pourra etre remplacee plus tard par un mapping explicite si un moteur PJM utilise un nom non standard.

## Prix negocies

Le mode `negotiated` cherche une combinaison sauvegardee dont les choix correspondent aux options Pressero selectionnees.

Le prix est resolu ainsi :

- palier exact si disponible;
- interpolation lineaire entre deux paliers;
- premier palier si la quantite est sous le minimum;
- dernier palier si la quantite depasse le maximum.

## Script visuel Pressero

Le fichier public suivant contient maintenant un runtime generique :

```text
/public/pressero/visual-configurator.js
```

Il charge :

```text
/pressero-config/public/products/:misProductId/visual-config
```

Puis il :

- trouve les vrais champs `select` Pressero correspondant aux options;
- masque uniquement les lignes natives transformees visuellement;
- affiche les choix avec image;
- modifie le vrai select Pressero;
- declenche un seul evenement `change`.

Il ne calcule jamais le prix cote navigateur.

## Utilisation cote Pressero

Exemple de configuration :

```html
<script>
window.PresseroPjmVisualConfig = {
  misProductId: "MWP-..."
};
</script>
<script src="https://pressero-pjm-visual-middleware.onrender.com/public/pressero/visual-configurator.js"></script>
```

Alternative :

```html
<script
  src="https://pressero-pjm-visual-middleware.onrender.com/public/pressero/visual-configurator.js"
  data-mis-product-id="MWP-..."
></script>
```

## Tests automatises

```text
npm run test:sprint44
npm run build
```
