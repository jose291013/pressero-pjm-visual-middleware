# Sprint 15 Pricing Basis Formula

## Goal

Prepare negotiated price exports for both quantity-tier pricing and area-tier pricing.

The admin can now choose the tier mode:

- `quantity`: existing quantity tiers, such as 1, 5, 25, 50;
- `areaM2`: m2 area tiers where the effective tier quantity will later be calculated from a formula.

## Admin Form

The `Prix negocies` screen now captures:

- `Mode de palier`;
- `Formule de calcul`;
- a dropdown of PJM calculation parameters that can be inserted into the formula.

The parameter dropdown is built from compatible PJM options that do not expose fixed choices. These are typically free numeric fields such as width, height, page count or copy quantity.

Example formulas:

```text
{Quantite d'exemplaires} * {Nombre de pages}
```

```text
({Largeur de la banderole en cm.} / 100) * ({Hauteur de la banderole en cm.} / 100) * {Quantite d'exemplaires}
```

`areaM2` requires a formula before preview or export. `quantity` keeps a blank formula valid so the Sprint 14 workflow remains available.

## Excel Export

The preview and XLSX export include:

- visible `Mode palier`;
- visible `Formule palier`;
- hidden `Parametres formule`, storing the PJM keys available for the formula.

The combination hashes now include the tier mode and formula, so a quantity export and an area export cannot reuse the same negotiated price reference accidentally.

## Deferred Work

This sprint does not evaluate formulas and does not call PJM `optionsandprice` yet.

The next pricing sprint should:

- evaluate the formula per generated row and quantity tier;
- use the calculated value to select the right PJM tier;
- fill `Prix PJM <tier>` from PJM;
- keep `Prix negocie <tier>` editable for import.
