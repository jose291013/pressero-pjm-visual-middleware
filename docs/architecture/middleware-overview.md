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

## Sprint 43 Pressero Product String

If Pressero sends `product` directly as a string, the provider now treats that string as the `MIS Product ID`. Diagnostics also include `productType` and `productPreview` to distinguish string payloads from object payloads.

## Sprint 44 Pressero Price And Visual Runtime

The Pressero pricing provider now resolves the product configuration from the `MIS Product ID` and routes price calculation by mode:

- `pjmLive` calls PJM `optionsandprice`;
- `negotiated` resolves the saved negotiated combination and interpolates between tiers.

The public visual runtime `/public/pressero/visual-configurator.js` now loads the product visual config, renders mapped image choices, updates real Pressero selects and dispatches the native `change` event. It does not calculate price in the browser.

## Sprint 45 Pressero Quantity And Visual CORS

The public Pressero endpoints now allow cross-origin reads for the visual runtime:

- `/public/pressero/...`
- `/pressero-config/public/...`

Visual choices expose `valueAliases` so the browser script can match PJM values, PJM IDs and labels against the actual native Pressero select option values.

This sprint originally forced the Pressero `body.quantity` value into the real PJM quantity parameter. That behavior is superseded by Sprint 50: the provider now preserves Pressero/PJM `{ Key, Value }` pairs and lets PJM validate them through the `options` flow.

## Sprint 46 Pressero Re-render And Minimum Quantity

The visual runtime now survives Pressero internal DOM refreshes. It attaches a guarded `MutationObserver` to `document.body` and re-renders the visual option buttons after Pressero replaces the native option block.

The minimum-quantity retry behavior introduced here is superseded by Sprint 50. The runtime re-render fix remains active; quantity and compatibility handling now follow the PJM `options` then `optionsandprice` flow.

## Sprint 47 Pressero Free Quantity Option

`GetOptionsForProduct` now returns PJM free-input parameters as Pressero pricing parameters with `Options: []`. This allows quantity-like PJM parameters, such as `Quantite d'exemplaires`, to be displayed by Pressero instead of relying only on the generic external-pricing `Quantity` field.

When calculating live PJM prices, the middleware returns the free-input parameter to Pressero. Sprint 50 later changed calculation so the submitted PJM option value is preserved directly rather than merged with the generic Pressero quantity.

## Sprint 48 Pressero Numeric Option And Generic Quantity

The provider now accepts Pressero option values sent as strings, numbers or booleans, then converts them to strings before building the PJM payload. This prevents free-input PJM fields such as `Quantite d'exemplaires` from being dropped when Pressero sends numeric values.

The visual runtime hides the generic external-pricing `Quantity` field when a real PJM quantity field is present in the page. The PJM quantity field remains visible and native.

## Sprint 49 Pressero Composite Option Keys

Pressero can send option keys as composite values such as `prefix:optionId`. The pricing provider now matches both the full key and each colon-separated part when resolving Pressero options to PJM options and choices.

This allows free-input PJM fields such as `Quantite d'exemplaires` to be correctly mapped even when Pressero wraps the PJM option ID in a composite key.

## Sprint 50 Pressero PJM Options Sanitize Flow

The live PJM pricing provider now mirrors the `saas-orchestrator` flow:

- preserve the `{ Key, Value }` option pairs submitted by Pressero;
- call PJM `options` first with those values;
- sanitize the submitted values against the compatible options returned by PJM;
- call PJM `optionsandprice` with the sanitized values.

The middleware ne remplace plus the native PJM quantity value with the generic external-pricing `Quantity` field and no longer retries with a guessed minimum quantity. PJM remains the source for incompatibilities, free-input validation and final price calculation.

## Sprint 51 Live Options Compatibility

`GetOptionsForProduct` now receives the current Pressero payload and calls PJM `options` for standard live PJM products. The returned Pressero `PricingParameter[]` is rebuilt from PJM's live compatible options instead of always using the synchronized database snapshot.

This allows Pressero option refreshes to reflect PJM incompatibilites after each user selection. The synchronized options remain a fallback when PJM returns no usable live options.

## Sprint 52 Filter Incompatible Options

The Pressero provider now filters PJM live options and choices marked as unavailable before returning `PricingParameter[]` to Pressero. Flags such as `Suppress`, `Hidden`, `Disabled`, `Available=false`, `Enabled=false` and `Visible=false` remove the option or choice from the user-facing list.

The same filtering applies before `optionsandprice`, so a previously selected value that PJM now marks as incompatible is not kept in the calculation payload.

## Sprint 53 Progressive PJM Options

The provider now follows the same progressive compatibility pattern as the `saas-orchestrator` wizard. It first calls PJM `options` with no selections to read the engine order, then walks each option with only the previously accepted values.

Pressero options are built from these progressive responses, and `optionsandprice` receives the same accepted values. This avoids showing choices that PJM would later ignore because they are incompatible with earlier selections.

## Sprint 54 Hide Incompatible Visual Choices

The static public `visual-config` still exposes the complete mapped image library for the product, but the browser runtime now filters buttons against the current native Pressero select options before rendering them.

The backend also probes each candidate choice with PJM `options` using the previously accepted values plus that candidate. Choices that PJM rejects or does not keep available are removed before Pressero sees them. This keeps image buttons aligned with the native Pressero select and avoids showing incompatible choices.

## Sprint 55 Neutral-Only Visual Groups And Faster Probes

The browser runtime now hides an entire visual option group when only one neutral choice remains, such as `Aucun`, `none`, `sans` or `--Select--`. This removes labels like `Pelliculage` when the only remaining valid state is no finishing.

PJM candidate probes are also executed in parallel per option, and probing is skipped when no previous accepted values exist. This keeps the compatibility check while reducing the delay introduced by sequential candidate calls.

## Sprint 56 Fast Live Pricing

Live PJM pricing now attempts one `optionsandprice` call with the `{ Key, Value }` pairs submitted by Pressero before using the slower progressive fallback. This keeps the normal price path short while preserving the compatibility safety path for rejected configurations.

The middleware also keeps a singleton PJM client for env-based usage so the PJM auth token survives across requests. A short TTL cache deduplicates repeated `options` and `optionsandprice` calls triggered by Pressero refreshes.

## Sprint 57 Pressero Native Loading Neutralization

The visual runtime now places its root outside the native pricing loading container when possible, so Pressero refresh overlays do not gray the image configurator. During native recalculation it also suppresses known Pressero/Kendo loading masks and restores scroll after the real select dispatches its `change` event.

The V22.1 contract remains intact: visual buttons still update real Pressero/PJM fields, dispatch one native `change`, and leave price calculation to Pressero/PJM.

## Sprint 58 PJM Auth Retry And Stable Native Fields

The PJM client now retries authenticated requests once after a `401` by forcing a fresh token with `authenticate(true)`. This protects Render's long-lived PJM singleton from stale or rejected tokens without requiring admin changes.

The public visual runtime now stores remembered native field selectors and keeps a dynamic CSS sheet for those fields. When Pressero rebuilds the pricing DOM, the native selects are hidden immediately and the visual rerender delay is reduced, preventing the dropdown flash and reducing unwanted scroll jumps.

## Sprint 59 Stable Option Render After Quantity Reorder

The Pressero pricing provider now returns choice-bearing parameters before free-input parameters, so a PJM quantity field with `Options: []` cannot lead the response and prevent later visual choices from rendering in Pressero.

The visual runtime also delays the no-match warning while Pressero is still building native fields. It retries short render cycles before showing `Aucune option visuelle...`, avoiding a false warning during option initialization.

## Sprint 60 Native Scroll Jump Guard

The public visual runtime now hides transformed native Pressero option rows with `display:none` instead of moving their fields offscreen, preventing a short native dropdown flash during recalculation.

It also disables `overflow-anchor` on the visual and native pricing containers and restores the current scroll position several times during Pressero's recalculation window. This keeps visible native fields such as quantity stable when they trigger pricing updates.

## Sprint 61 Native Scroll Hold And Stale Render Guard

The public visual runtime now starts a temporary scroll hold as soon as a native Pressero/PJM pricing field receives mouse or focus interaction. During that hold, the native `change` handler does not overwrite the saved scroll position after Pressero has already moved the page.

Late scroll events are restored immediately, and transient Pressero rerenders no longer clear the visual configurator while no matching native fields are available. The runtime keeps the previous visual UI until the rebuilt native fields can be matched again.
