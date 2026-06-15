# Sprint 17 Compatible XLSX Export

## Goal

Export only PJM-compatible negotiated price combinations to Excel.

Sprint 16 exposed compatible and excluded counts. Sprint 17 uses that information during export so the workbook does not contain impossible rows.

## Admin Flow

The admin can still click `Verifier` manually.

The export performs a verification automatique when the current form has no matching cached verification.

When `Exporter Excel` is clicked:

1. if the current form already has a matching compatibility verification, the export reuses it;
2. if the form changed or was never verified, the admin UI runs the verification automatically;
3. if no compatible combination exists, the export is blocked;
4. the export payload includes a `compatibilityFilter` with the compatible combination keys.

The compatibility cache is invalidated when the admin changes the selected options, quantity tiers, pricing mode, formula, organization or engine price group.

## Backend

The Excel plan now accepts:

```json
{
  "compatibilityFilter": {
    "rawCombinationCount": 4,
    "compatibleCombinationCount": 2,
    "incompatibleCombinationCount": 2,
    "compatibleCombinationKeys": ["..."]
  }
}
```

When the filter is present, the workbook rows are filtered to compatible keys only.

The backend rejects stale filters when:

- the raw combination count no longer matches the current payload;
- the compatible key count no longer matches the generated rows.

This prevents an old verification result from being reused after the admin changes the form.

## Excel Help Sheet

The `Aide` sheet now records:

- raw combinations;
- exported combinations;
- excluded combinations.

The `Prix negocies` sheet contains only compatible rows, so only combinaisons compatibles are exported when a verification filter is supplied.

## Deferred Work

The next sprint can use the same compatible rows for Excel import and persistence of negotiated prices.
