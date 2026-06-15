# Sprint 19 Direct Negotiated Prices

## Goal

Allow direct negotiated price entry from the admin UI when the configured PJM path produces a single combination.

The Excel workflow remains available for bulk work, but a single-line negotiated product can now be created without exporting a workbook.

## Admin Flow

The `Prix negocies` panel now includes `Prix directs`.

The admin can:

1. configure one PJM option path;
2. set free fixed parameters such as `Nombre de pages`;
3. keep one customer variable such as `Quantite d'exemplaires`;
4. click `Calculer PJM`;
5. enter a negotiated price next to each PJM tier price;
6. click `Enregistrer`;
7. receive a generated `MISID`.

The generated `MISID` is the future reference Pressero will send to the middleware to retrieve the matching negotiated form and price.

## Backend Endpoints

```http
POST /negotiated-prices/direct-preview
```

Calculates the PJM price for each tier through `optionsandprice` when exactly one customer variable can receive the tier value.

```http
POST /negotiated-prices/direct-save
```

Persists the direct negotiated prices in the existing negotiated price tables:

- one `NegotiatedPriceProfile` named with the generated MISID;
- one `NegotiatedPriceCombinationSet` per tier.

## Current Constraint

Direct PJM tier calculation requires exactly one client variable.

If a formula contains several client variables, for example width, height and quantity, the middleware cannot infer which values to send to PJM for each tier without additional sample values. In that case, the direct preview returns warnings and leaves PJM prices empty.

## Next Step

The next sprint should expose a Pressero-facing lookup endpoint using the generated MISID.
