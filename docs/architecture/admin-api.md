# Admin API

Sprint 6 prepares the backend API that the future backoffice will consume.

The API is read-only in this sprint. It does not trigger PJM synchronization, does not write mappings, and does not manage media assets yet.

## PJM Catalog Summary

```http
GET /pjm-sync/admin/summary
```

Returns counts for engines, price groups, product categories, mappings, options and choices, plus the latest update timestamp found in the synced catalog tables.

## Price Engines

```http
GET /pjm-sync/admin/price-engines
```

Returns engines with product category, price group mappings and counts.

## Organizations

```http
GET /pjm-sync/admin/organizations
```

Returns organization criteria derived from negotiated price profiles. This prepares the catalog UI for the future negotiated-prices workflow without changing PJM sync data.

```http
GET /pjm-sync/admin/price-engines/:id
```

Returns one engine by internal ID or PJM ID with mappings, options and choices.

## Engine Mappings

```http
GET /pjm-sync/admin/price-engines/:id/mappings
```

Returns price group mappings for one engine.

## Engine Options

```http
GET /pjm-sync/admin/price-engines/:id/options
```

Returns options and choices for one engine.

## Next UI Step

The first backoffice screen can use these endpoints to show:

- catalog sync summary;
- engine list;
- engine detail;
- mappings;
- options and choices.

## Sprint 7 UI

The first static backoffice screen is served at:

```http
GET /admin
```

Static assets are served under:

```http
GET /public/admin/admin.css
GET /public/admin/admin.js
```

The page reads only from the Sprint 6 API. It does not trigger synchronization, does not mutate mappings, and does not manage media assets yet.

## Sprint 8 Admin Sync Trigger

The backoffice can now trigger an explicit catalog sync:

```http
POST /pjm-sync/admin/sync
```

This endpoint calls the existing PJM catalog sync service. It is explicit: the server still does not synchronize with PJM at startup.

Successful response:

```json
{
  "data": {
    "enginesProcessed": 1,
    "priceGroupsProcessed": 2,
    "mappingsProcessed": 2,
    "optionsProcessed": 2,
    "choicesProcessed": 4,
    "warnings": []
  }
}
```

If PJM credentials are missing or PJM rejects the request, the endpoint returns a JSON error that the admin UI can display.

## Sprint 9 Catalog Organization

The admin UI now shows three main KPI cards:

- engines;
- price groups;
- product categories.

The engine list can be filtered by search text, product category when available, price group and organization. The real PJM `productEngines/list` response inspected during this sprint exposes `Id`, `Name` and `Mappings`, but no product category field, so categories are only shown when they already exist in the local database.

## Sprint 11 Negotiated Prices Preview

The admin UI now includes a `Prix negocies` view.

It uses the existing catalog endpoints to select a PJM engine and price group, then calls:

```http
POST /negotiated-prices/preview
```

The preview returns the future Excel shape: one row per selected option-choice combination and final price columns generated from the quantity tiers textarea.

This screen does not generate the `.xlsx` file yet and does not import negotiated prices yet.

## Sprint 12 Option Labels

The admin UI expects synced PJM choices to expose readable labels through `choice.name`.

The sync normalizer now maps PJM choice labels from `Key`, `Label`, `Text`, `DisplayName`, `Title`, `Description` or `Name`, while keeping the PJM technical value in `choice.value`. If an existing database was synchronized before this sprint, relaunch the admin `Synchroniser PJM` action to refresh stored choice labels.

The negotiated-prices organization field remains manual for now. The final behavior should use a Pressero site dropdown once Pressero site synchronization exists.

## Sprint 13 Compatible Options

The negotiated-prices admin screen can now ask PJM for the compatible option path:

```http
POST /negotiated-prices/compatible-options
```

The request sends the selected `EnginePriceGroupIntegrationId` and the current option selections as PJM `Key`/`Value` pairs. The backend calls PJM with `Operation: "options"` and returns normalized options for the UI.

The UI reveals selected options plus the next compatible option. If multiple choices are checked for one option, the first checked choice drives the compatibility path for discovering the next option.

## Sprint 14 XLSX Export

The negotiated-prices admin screen can now export the current preview payload as an Excel workbook:

```http
POST /negotiated-prices/export
```

The response is an `.xlsx` attachment. It contains the combination rows, visible option labels, price tier columns and hidden technical columns for the future import.

This endpoint does not call PJM `optionsandprice` yet. The `Prix PJM <quantity>` columns are present but empty until the reference-price sprint is implemented.

## Sprint 15 Pricing Basis Formula

The negotiated-prices preview and export payloads can now include a `pricingBasis` block:

```json
{
  "pricingBasis": {
    "mode": "areaM2",
    "formula": "({Largeur} / 100) * ({Hauteur} / 100) * {Quantite}",
    "parameters": [
      {
        "key": "local-option-id",
        "label": "Largeur",
        "pjmKey": "pjm-option-key"
      }
    ]
  }
}
```

The admin UI builds the formula parameter dropdown from compatible PJM options that have no fixed choices. `quantity` mode remains compatible with a blank formula. `areaM2` mode requires a formula before preview/export.

The generated preview and workbook include `Mode palier` and `Formule palier`. Formula evaluation and PJM `optionsandprice` calls are deferred to a later sprint.
