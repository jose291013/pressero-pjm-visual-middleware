# Sprint 18 Fixed Calculation Parameters

## Goal

Support PJM free calculation parameters that should be fixed by the admin instead of asked to the Pressero customer.

Example:

- `Quantite d'exemplaires` can be used in the tier formula and becomes a customer variable;
- `Nombre de pages` can be absent from the formula and fixed by the admin, for example `16`.

## Admin Rule

Free PJM parameters are classified from the formula:

- present as `{Label}` in the formula: `Variable client`;
- absent from the formula: `Valeur fixe`.

The admin screen now shows these parameters in the central `Options PJM` panel under `Parametres libres`.

Fixed parameters require an admin value before preview/export.

## Option Selection Rule

The option path now uses one selected choice per PJM option in the admin UI.

PJM still drives the next compatible option through `Operation: "options"`. The admin is no longer expected to create many incompatible branches from multiple checked values in one option.

## Export Metadata

The pricing basis now stores each parameter with:

```json
{
  "key": "local-option-id",
  "label": "Nombre de pages",
  "pjmKey": "pjm-option-key",
  "role": "adminFixed",
  "fixedValue": "16"
}
```

These roles are stored in hidden workbook metadata and summarized on the `Aide` sheet as `Variables client` and `Parametres fixes`.

## Stable References

The combination hash now includes the pricing-basis parameters, roles and fixed values.

This prevents a 16-page brochure and a 32-page brochure from sharing the same negotiated-price reference.
