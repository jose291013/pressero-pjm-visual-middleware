# Admin API

Sprint 6 prepares the backend API that the future backoffice will consume.

The API is read-only in this sprint. It does not trigger PJM synchronization, does not write mappings, and does not manage media assets yet.

## PJM Catalog Summary

```http
GET /pjm-sync/admin/summary
```

Returns counts for engines, price groups, mappings, options and choices, plus the latest update timestamp found in the synced catalog tables.

## Price Engines

```http
GET /pjm-sync/admin/price-engines
```

Returns engines with product category, price group mappings and counts.

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
