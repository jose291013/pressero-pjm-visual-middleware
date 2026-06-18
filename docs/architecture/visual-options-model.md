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

## Sprint 33 Visual Mapping Admin

The `Mappings` admin view now exposes the concrete mapping workflow.

For a selected PJM engine, the middleware reads the local synchronized options and choices, then compares each choice label with existing `MediaAsset.key` values using the same normalization rule as the ZIP import.

Each choice can be in one of three states:

- `mapped`: a `VisualOptionMapping` already points to a media asset;
- `auto_match`: no saved mapping exists, but a media asset key matches the normalized PJM choice label;
- `missing`: no saved mapping and no matching media key.

The admin can export an Excel workbook with the PJM option/choice labels, hidden stable IDs and the expected image key. The import reads the `Cle image a associer` column and saves mappings to `VisualOptionMapping`.

This keeps the future Pressero JSON generation deterministic:

```text
PjmOptionChoice.id -> VisualOptionMapping.mediaAssetId -> MediaAsset.publicUrl
```

The mapping layer is shared by standard PJM pricing products and negotiated price products.
