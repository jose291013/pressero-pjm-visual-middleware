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
