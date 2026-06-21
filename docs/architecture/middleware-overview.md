# Middleware Overview

The middleware sits between PJM data and the lightweight Pressero visual configurator.

Core rule:

```text
Visual interface
-> real Pressero/PJM fields
-> native PJM recalculation
-> native price
-> native cart
```

The backend stores PJM references, media metadata, visual mappings and future negotiated price profiles. It must generate compact product-specific JSON for Pressero instead of exposing the full PJM database to the browser.

## Sprint 26 Pressero Product Configs

Pressero sends a `MIS Product ID` when an external pricing engine is attached to a product. The middleware now treats that value as its product entry key.

The saved configuration decides whether the product uses:

- `pjmLive`: PJM standard pricing through the middleware;
- `negotiated`: a negotiated MISID profile.

Both modes share the future image library and option mapping layer. The difference is only the pricing source.

## Sprint 27 Generated MIS Product ID

The Pressero column `MIS Product ID price 1` stores a middleware-generated product reference. It exists for both standard PJM pricing and negotiated pricing.

This value is different from an internal negotiated pricing profile reference:

```text
MIS Product ID price 1 -> middleware product config
Negotiated pricing MISID -> internal negotiated tier profile
```

Pressero pairs `Pricing Engine price 1` with `MIS Product ID price 1`. The pricing engine points to the middleware URL; the MIS Product ID tells the middleware which product configuration to resolve.

## Sprint 28 Pressero Organization Search

The `Produits Pressero` admin form now uses the visible organization name as the editable field. The organization integration ID is derived from that selection and kept read-only.

Negotiated pricing profile choices are loaded with stale-request protection, and duplicate profiles are removed before rendering.

## Sprint 30 Pressero Negotiated Without Group

In `Produits Pressero`, the price group is required only for `PJM standard`.

For `Prix negocie`, the admin selects organization, PJM engine and negotiated MIS ID. The group used for the PJM reference price is derived from the negotiated profile itself, so the admin does not need to remember which price group was used during negotiated price creation.

## Sprint 31 Media Library Admin

The `Images` admin section now manages `MediaAsset` records by URL.

This is the shared image/icon library for both future standard PJM visual products and negotiated products. It does not change PJM pricing or Pressero native quantity behavior; it only prepares stable media references that later mappings can attach to real PJM option choices.

## Sprint 32 Media ZIP Import

The media library can import a ZIP of image/icon files and store them under a public middleware URL.

Default storage is `src/public/media/assets`, exposed as `/public/media/assets/...`. On Render, set `MEDIA_ASSETS_DIR` to a persistent disk path such as `/var/data/media/assets` if uploaded files must survive redeployments. The database still stores only `MediaAsset` metadata and URLs.

## Sprint 33 Visual Option Mapping

The `visual-options` module is now mounted under `/visual-options`.

Its admin endpoints let the backoffice build the stable relationship between synchronized PJM choices and media assets. This mapping is independent from the pricing mode:

- standard PJM products will use it to display image/icon choices while PJM keeps calculating the price;
- negotiated products will use the same image/icon library while the middleware resolves negotiated MIS IDs and tiers.

The Excel export/import flow is intended for bulk preparation. Image files can be imported as a ZIP, then option mappings can be exported, filled with `MediaAsset.key` values and imported back.

## Sprint 36 Public Visual Product Config

The middleware now exposes a public product visual configuration endpoint:

```text
GET /pressero-config/public/products/:misProductId/visual-config
```

The `MIS Product ID price 1` value saved in Pressero resolves to a `PresseroProductConfig`. For standard PJM pricing (`pjmLive`), the endpoint returns a compact JSON containing the organization, PJM engine, price group and only visual options with mapped images.

Image URLs that are already absolute, such as S3 or CloudFront URLs, are returned unchanged. Local `/public/media/assets/...` URLs are expanded using the request base URL, which allows Render to serve absolute image URLs.

This endpoint does not calculate price. It prepares the visual layer; PJM/Pressero native fields and recalculation remain authoritative.
