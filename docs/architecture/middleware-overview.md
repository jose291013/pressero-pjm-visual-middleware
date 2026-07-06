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

## Sprint 39 Pressero JSON Pricing Diagnostic

The middleware now exposes the first fixed JSON endpoint intended for the Pressero external pricing plugin:

```text
POST /pressero-pricing/json
```

This endpoint is diagnostic only. It returns a fixed price based on `pricingParameters.Q1` so the integration can confirm the response format expected by Pressero before PJM or negotiated-price logic is attached.

The URL configured in Pressero should be fixed at the plugin level:

```text
https://pressero-pjm-visual-middleware.onrender.com/pressero-pricing/json
```

The `MIS Product ID price 1` remains configured on each Pressero product. It is not part of this endpoint URL; the middleware will read it from the future Pressero pricing payload once the exact field is confirmed.

## Sprint 40 Pressero Provider Options

The Pressero pricing URL remains unique, but the provider now supports the two Pressero pricing-service responsibilities:

```text
GetOptionsForProduct -> return PricingParameter[]
GetPriceForProduct   -> return a pricing result
```

The middleware accepts both direct JSON calls on `/pressero-pricing/json` and method-style aliases such as `/pressero-pricing/json/GetOptionsForProduct`.

For `GetOptionsForProduct`, the incoming `productID` is resolved as the Pressero `MIS Product ID`. The middleware loads the active `PresseroProductConfig`, then returns PJM option parameters using the documented Pressero shape:

```text
ID, Label, Options[{ Key, Value }]
```

The price response remains diagnostic until the next pricing sprint replaces it with PJM `options and price` for standard products and negotiated tier resolution for negotiated products.

## Sprint 41 Pressero Pricing Render Diagnostics

The Pressero pricing provider now logs each request and response branch with the prefix:

```text
[pressero-pricing]
```

These logs expose the detected mode, path, productId, quantity, body keys, query keys, pricing parameter keys and option counts. They are intended to identify whether Pressero calls the options branch, sends the MIS Product ID, or receives an empty option set.

## Sprint 42 Pressero JSON Operation Product

Render logs showed that Pressero JSON calls use a body shaped around `operation`, `product`, `options`, `quantity` and `customer`.

The provider now inspects `operation` when detecting options versus price calls, and it also searches for the Pressero `MIS Product ID` inside the nested `product` object.

Diagnostics now include `operation`, `productKeys` and `rawOptionCount` so the next Pressero test can reveal the exact option-call contract.
