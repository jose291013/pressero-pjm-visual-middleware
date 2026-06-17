export type MediaLibraryModuleStatus = "admin_library";

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
