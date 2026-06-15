# Sprint 16 Compatible Combination Validation

## Goal

Verify negotiated price combinations against PJM compatibility before using them as the basis for Pressero-facing negotiated pricing.

Sprint 15 still generated a Cartesian product from the selected choices. That is useful for previewing volume, but it can include impossible combinations when PJM rules make choices mutually incompatible.

## Backend

New endpoint:

```http
POST /negotiated-prices/validate-combinations
```

The request body is the same payload used by preview/export.

The backend:

1. builds the current combination plan;
2. walks each row choice by choice;
3. calls PJM `Operation: "options"` for the current selection path;
4. checks whether the next selected choice is still available;
5. returns compatible and incompatible counts plus their combination keys.

PJM responses are cached by selection path during the request. If many generated rows share the same prefix, the middleware reuses the compatible option list instead of asking PJM again.

## Admin UI

The `Prix negocies` screen now has a `Verifier` button next to preview/export.

The preview panel shows:

- raw combination count from the existing preview;
- compatible combination count;
- excluded combination count;
- PJM request count for the verification run.

## Important Boundary

This sprint does not change the Excel export yet.

The current export still writes the raw selected Cartesian product. The next sprint can use the validated compatible keys to export only valid rows once this behavior has been checked with real PJM engines.

## Pressero Implication

For future Pressero negotiated-price engines, the admin-selected choices define the allowed perimeter. PJM compatibility validation defines the valid paths inside that perimeter.

Pressero should later receive only compatible next options from the middleware, based on the same validated path logic.
