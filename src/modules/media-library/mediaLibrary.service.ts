import type { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import type { MediaAssetInput, MediaAssetSummary } from "./mediaLibrary.types.js";

const mediaAssetInclude = {
  _count: {
    select: {
      visualMappings: true
    }
  }
} satisfies Prisma.MediaAssetInclude;

type MediaAssetRecord = Prisma.MediaAssetGetPayload<{
  include: typeof mediaAssetInclude;
}>;

export function getMediaLibraryModuleName() {
  return "media-library";
}

export function normalizeMediaKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function inferMimeType(fileNameOrUrl: string) {
  const lower = fileNameOrUrl.toLowerCase().split("?")[0] ?? "";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".gif")) return "image/gif";
  return "application/octet-stream";
}

function serializeMediaAsset(asset: MediaAssetRecord): MediaAssetSummary {
  return {
    id: asset.id,
    key: asset.key,
    fileName: asset.fileName,
    mimeType: asset.mimeType,
    url: asset.url,
    altText: asset.altText,
    width: asset.width,
    height: asset.height,
    byteSize: asset.byteSize,
    visualMappingCount: asset._count.visualMappings,
    createdAt: asset.createdAt.toISOString(),
    updatedAt: asset.updatedAt.toISOString()
  };
}

function readOptionalNumber(value: MediaAssetInput["width"], fieldName: string) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue < 0) {
    throw new Error(`${fieldName} doit etre un entier positif.`);
  }

  return numberValue;
}

function readFileNameFromUrl(url: string) {
  try {
    const parsed = url.startsWith("/") ? null : new URL(url);
    const pathName = parsed?.pathname ?? url;
    const fileName = decodeURIComponent(pathName.split("/").filter(Boolean).pop() ?? "");
    return fileName || "media-asset";
  } catch (_error) {
    const fileName = url.split("?")[0]?.split("/").filter(Boolean).pop() ?? "";
    return fileName || "media-asset";
  }
}

function normalizeInput(input: MediaAssetInput) {
  const url = input.url?.trim() ?? "";
  if (!url) {
    throw new Error("URL image obligatoire.");
  }

  if (
    !url.startsWith("https://") &&
    !url.startsWith("http://") &&
    !url.startsWith("/public/")
  ) {
    throw new Error("URL image invalide. Utilisez http(s) ou /public/...");
  }

  const fileName = input.fileName?.trim() || readFileNameFromUrl(url);
  const key = normalizeMediaKey(input.key?.trim() || fileName);
  if (!key) {
    throw new Error("Cle image obligatoire.");
  }

  return {
    key,
    fileName,
    mimeType: input.mimeType?.trim() || inferMimeType(fileName || url),
    url,
    altText: input.altText?.trim() || null,
    width: readOptionalNumber(input.width, "Largeur"),
    height: readOptionalNumber(input.height, "Hauteur"),
    byteSize: readOptionalNumber(input.byteSize, "Poids")
  };
}

function readAssetId(assetId: string) {
  const id = assetId.trim();
  if (!id) {
    throw new Error("Media asset ID obligatoire.");
  }
  return id;
}

export async function listMediaAssets(search = "") {
  const query = search.trim();
  const where: Prisma.MediaAssetWhereInput = query
    ? {
        OR: [
          { key: { contains: query, mode: "insensitive" } },
          { fileName: { contains: query, mode: "insensitive" } },
          { altText: { contains: query, mode: "insensitive" } },
          { url: { contains: query, mode: "insensitive" } }
        ]
      }
    : {};

  const assets = await prisma.mediaAsset.findMany({
    where,
    include: mediaAssetInclude,
    orderBy: [
      {
        updatedAt: "desc"
      },
      {
        key: "asc"
      }
    ],
    take: 250
  });

  return assets.map(serializeMediaAsset);
}

export async function createMediaAsset(
  input: MediaAssetInput
): Promise<MediaAssetSummary> {
  const normalized = normalizeInput(input);
  const asset = await prisma.mediaAsset.create({
    data: normalized,
    include: mediaAssetInclude
  });

  return serializeMediaAsset(asset);
}

export async function updateMediaAsset(
  assetId: string,
  input: MediaAssetInput
): Promise<MediaAssetSummary> {
  const id = readAssetId(assetId);
  const normalized = normalizeInput(input);
  const asset = await prisma.mediaAsset.update({
    where: {
      id
    },
    data: normalized,
    include: mediaAssetInclude
  });

  return serializeMediaAsset(asset);
}

export async function deleteMediaAsset(assetId: string) {
  const id = readAssetId(assetId);
  const linkedMappings = await prisma.visualOptionMapping.count({
    where: {
      mediaAssetId: id
    }
  });

  if (linkedMappings) {
    throw new Error(
      "Cette image est associee a des mappings visuels et ne peut pas etre supprimee."
    );
  }

  const asset = await prisma.mediaAsset.delete({
    where: {
      id
    }
  });

  return {
    id: asset.id,
    key: asset.key,
    deleted: true
  };
}
