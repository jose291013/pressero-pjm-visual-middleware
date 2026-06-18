# Visual Options Model

The `visual-options` module maps real PJM option choices to media assets.

Mappings must use stable internal IDs and PJM references. They must not depend only on image names. The Pressero script should use the generated configuration to update real PJM fields and trigger native recalculation.

## Sprint 31 Media Library Admin

The media library is now the first admin-managed source for visual assets.

Each `MediaAsset` stores a stable key, file name, MIME type, public URL and optional metadata. The URL can point to an external CDN/S3 asset or to a file served by the middleware under `/public/...`.

The visual mapping layer must reference `MediaAsset.id`, not the file name or visible label. This keeps future option mappings stable even if the image URL, alt text or file name changes.

Deletion is blocked when an asset is already used by a `VisualOptionMapping`.

## Sprint 32 ZIP Import And Matching Keys

Bulk-imported image files use the normalized base file name as the `MediaAsset.key`.

```text
Papier couche 135 g.webp -> papier-couche-135-g
Papier couche 135 g.svg  -> papier-couche-135-g
```

This prepares automatic matching against normalized PJM option choice labels. The future mapping screen should compare `PjmOptionChoice.name` normalized with `MediaAsset.key`, then propose matches before saving `VisualOptionMapping` records.
