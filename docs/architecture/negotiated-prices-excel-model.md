# Negotiated Prices Excel Model

The `negotiated-prices` module will manage negotiated prices by stable combinations.

Future Excel exports should contain readable labels, real PJM prices when available, negotiated prices, and protected technical columns such as combination hashes. Sprint 1 creates only the module boundary and initial Prisma models.

## Sprint 10 Confirmed Shape

The Excel export uses one row per option-choice combination.

Quantity tiers are entered by the admin in a textarea, one quantity per line. The same list becomes the final Excel price columns.

Example textarea:

```text
1
5
25
50
100
250
500
1000
```

Example columns:

```text
Combination Key
Organisation ID
Organisation
Moteur PJM
Groupe de prix
Option A
Option B
Prix PJM 1
Prix negocie 1
Prix PJM 5
Prix negocie 5
...
```

If each selected option has one selected choice, the export has one row. If an option has multiple selected choices, the generator creates the Cartesian product across all selected options.

Each row has a base `combinationKey`. Each quantity tier also has its own stable `combinationHash` because persistence stores negotiated prices by combination and quantity.

## Sprint 13 Compatible Selection Path

The admin option picker now uses PJM `Operation: "options"` to refresh compatible options after each selection. This prevents the admin from selecting from a fully static option list when PJM has already removed incompatible options.

For preview, the selected visible choices still produce a Cartesian product. When several choices are selected for one option, the first checked choice is used only to discover the next PJM-compatible option path.

Before filling real PJM prices in Excel, a later sprint should expand this into branch-by-branch compatibility checks so every generated row is validated against PJM.

## Sprint 14 XLSX Export

The middleware now generates a real Excel workbook through:

```http
POST /negotiated-prices/export
```

The workbook contains:

- `Prix negocies`: the editable export sheet;
- `Aide`: context and usage notes;
- hidden technical columns such as combination keys, PJM IDs and tier hashes;
- visible columns for context, option choices, `Prix PJM <quantity>` and `Prix negocie <quantity>`.

The price columns are intentionally empty in this sprint. `Prix PJM <quantity>` will be filled by a later `optionsandprice` sprint, while `Prix negocie <quantity>` will remain editable before import.

## Sprint 15 Pricing Basis Formula

Negotiated price exports now carry the tier calculation basis.

The preview/export payload can include:

```json
{
  "pricingBasis": {
    "mode": "quantity",
    "formula": "",
    "parameters": [
      {
        "key": "pjm-option-local-id",
        "label": "Quantite d'exemplaires",
        "pjmKey": "pjm-option-key"
      }
    ]
  }
}
```

`mode` can be:

- `quantity`: the existing quantity-tier behavior;
- `areaM2`: future m2-tier behavior, where the effective tier will be calculated from the formula.

The workbook adds visible `Mode palier` and `Formule palier` columns, plus a hidden `Parametres formule` column. The hidden data keeps the PJM parameter keys available for future import and price calculation.

The stable combination hashes now include the tier mode and formula. This prevents an area-based negotiated price from sharing a reference with a quantity-based negotiated price that happens to use the same option choices.

## Sprint 16 Compatible Combination Validation

The admin can now verify whether the selected Cartesian product contains only PJM-compatible paths.

The validation endpoint uses the preview/export payload, generates the same raw rows, then walks each row through PJM compatible options. A row is compatible only when every next selected choice is still available after the previous selections have been sent to PJM.

This creates a measurable split between:

- raw selected combinations;
- combinaisons compatibles;
- excluded combinations.

This sprint intentionally does not change the workbook rows yet. The next Excel/import sprint should use the compatible keys as the allowed row set before saving negotiated prices.

## Sprint 17 Compatible XLSX Export

The XLSX export can now receive a `compatibilityFilter` produced by the Sprint 16 validation flow.

When the filter is present, the workbook includes uniquement les lignes compatibles. The excluded rows are not written to the editable `Prix negocies` sheet.

The `Aide` sheet records:

- raw combinations;
- exported compatible combinations;
- excluded combinations.

The backend checks that the filter still matches the current generated combination set before exporting. If the admin changes selected choices, pricing basis or quantity tiers after verification, the UI must run validation again before export.

## Sprint 18 Fixed Calculation Parameters

Free PJM calculation parameters are now part of the pricing basis.

The admin formula separates them into two roles:

- `clientVariable`: the parameter label appears in the formula and will later be requested from Pressero;
- `adminFixed`: the parameter does not appear in the formula and must be filled by the admin.

Example:

```text
Formula: {Quantite d'exemplaires}
Fixed: Nombre de pages = 16
```

The workbook help sheet summarizes both `Variables client` and `Parametres fixes`. Hidden pricing-basis metadata stores the parameter PJM keys, roles and fixed values.

The stable combination hash includes these parameter roles and fixed values, so negotiated prices cannot collide across different locked values such as page counts.

## Sprint 19 Direct Negotiated Prices

When the admin path produces one combination, negotiated prices can be entered directly from the admin UI.

The direct workflow shows:

- each configured tier;
- the PJM reference price when it can be calculated;
- an editable negotiated price;
- the generated MISID after save.

The first implementation stores the MISID as the negotiated profile name and stores one tier row per negotiated price.

The Excel workflow remains useful for bulk editing. The direct workflow is the preferred path for a single locked PJM configuration.

## Sprint 20 Direct Save Feedback

Direct save now gives the administrator an explicit visual confirmation.

The returned MISID is shown in a persistent success block in the `Prix directs` panel. Missing MISID responses are treated as errors, because Pressero will need that reference to request the negotiated form and later retrieve the right price.

## Sprint 21 Negotiated Profile Identity

The negotiated price model now separates the profile identity from the saved combination data.

The functional key is:

```text
Organisation + moteur de prix + MISID
```

The target storage model is:

```text
Profile -> Combination -> Tier
```

This prepares multi-combination profiles without forcing the client to rebuild PJM incompatibility rules. A profile can later contain several validated combinations, and each combination can own its negotiated tier prices.

For compatibility with the previous direct-save flow, legacy `NegotiatedPriceCombinationSet` rows are still written while the new `NegotiatedPriceCombination` and `NegotiatedPriceTier` records are introduced.

The composed key is indexed first, not enforced as a database unique constraint yet, to avoid a risky schema push on existing local data. The strict unique constraint belongs in a later migration/backfill sprint.

## Sprint 22 Multi-Combination Admin

Multi-combination profiles are now created from the admin UI.

The stored combinations become the future web-to-print allowlist:

```text
MISID -> validated combinations -> negotiated tiers
```

This is intentionally a liste blanche model. PJM remains responsible for compatibility while the admin creates each combination. Later, if options are visible to the Pressero customer, the customer will only navigate through choices present in the saved validated combinations.

## Sprint 24 Existing Negotiated Profiles

The admin workflow now exposes existing negotiated profiles for:

```text
Organisation + moteur de prix + groupe de prix
```

This lookup is separate from the final Pressero identity, which remains:

```text
Organisation + moteur de prix + MISID
```

The lookup helps administrators avoid duplicates while they are creating negotiated references. A saved combination cannot be created again in the same organization, engine and price-group context, even if the new save would generate a different MISID.

This strengthens the allowlist model: every customer-facing route should come from one saved validated combination, and each saved validated combination should have one source negotiated reference in its context.

## PJM Price Reference

The reference price is calculated with PJM `optionsandprice` using the selected `EnginePriceGroupIntegrationId` and the combination's selected engine values.

This sprint creates only the deterministic combination and column plan. The next Excel sprint can fill `Prix PJM <quantity>` by calling PJM, and the import sprint can persist `Prix negocie <quantity>`.

## PJM Job Creation

After a negotiated price is selected from Pressero, the middleware will later create the PJM job through:

```http
POST /api/public/jobs
```

The job payload must include the organization integration ID, engine integration ID, real PJM engine values and the negotiated price assigned to the created job.
