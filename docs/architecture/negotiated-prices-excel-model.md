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

## PJM Price Reference

The reference price is calculated with PJM `optionsandprice` using the selected `EnginePriceGroupIntegrationId` and the combination's selected engine values.

This sprint creates only the deterministic combination and column plan. The next Excel sprint can fill `Prix PJM <quantity>` by calling PJM, and the import sprint can persist `Prix negocie <quantity>`.

## PJM Job Creation

After a negotiated price is selected from Pressero, the middleware will later create the PJM job through:

```http
POST /api/public/jobs
```

The job payload must include the organization integration ID, engine integration ID, real PJM engine values and the negotiated price assigned to the created job.
