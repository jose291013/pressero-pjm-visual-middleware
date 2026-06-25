export type MediaLibraryModuleStatus = "admin_library" | "zip_import_library";

export type MediaAssetInput = {
  key?: string;
  fileName?: string;
  mimeType?: string;
  url?: string;
  altText?: string | null;
  width?: number | string | null;
  height?: number | string | null;
  byteSize?: number | string | null;
};

export type MediaAssetSummary = {
  id: string;
  key: string;
  fileName: string;
  mimeType: string;
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
  byteSize: number | null;
  visualMappingCount: number;
  createdAt: string;
  updatedAt: string;
};

export type MediaAssetZipImportItem = {
  fileName: string;
  key: string;
  url: string;
  status: "created" | "updated" | "skipped";
  reason?: string;
};

export type MediaAssetZipImportResult = {
  imported: number;
  skipped: number;
  items: MediaAssetZipImportItem[];
};

export type MediaAssetUrlImportInput = {
  baseUrl?: string;
  files?: string[] | string;
};

export type MediaAssetUrlImportResult = MediaAssetZipImportResult;
