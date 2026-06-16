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
