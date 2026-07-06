import AdmZip from "adm-zip";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Prisma } from "@prisma/client";
import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import type {
  MediaAssetGithubImportInput,
  MediaAssetGithubImportResult,
  MediaAssetInput,
  MediaAssetUrlImportInput,
  MediaAssetUrlImportResult,
  MediaAssetSummary,
  MediaAssetZipImportResult
} from "./mediaLibrary.types.js";

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

const allowedImageExtensions = new Set([".svg", ".webp", ".png", ".jpg", ".jpeg"]);
const publicMediaAssetsPath = "/public/media/assets";

type GithubContentEntry = {
  name?: unknown;
  path?: unknown;
  type?: unknown;
};

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

function readBaseNameWithoutExtension(fileNameOrUrl: string) {
  const fileName = readFileNameFromUrl(fileNameOrUrl);
  return fileName.replace(/\.[^.]+$/, "");
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
  const key = normalizeMediaKey(input.key?.trim() || readBaseNameWithoutExtension(fileName));
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

function readZipEntryFileName(entryName: string) {
  const normalizedName = entryName.replace(/\\/g, "/");
  if (!normalizedName || normalizedName.includes("../") || normalizedName.startsWith("/")) {
    return null;
  }

  const fileName = normalizedName.split("/").filter(Boolean).pop();
  return fileName || null;
}

function normalizeStoredFileName(originalFileName: string) {
  const extension = path.extname(originalFileName).toLowerCase();
  if (!allowedImageExtensions.has(extension)) {
    return null;
  }

  const key = normalizeMediaKey(originalFileName.replace(/\.[^.]+$/, ""));
  if (!key) {
    return null;
  }

  return {
    key,
    fileName: `${key}${extension}`,
    mimeType: inferMimeType(extension)
  };
}

function readUrlImportFiles(files: MediaAssetUrlImportInput["files"]) {
  if (Array.isArray(files)) {
    return files;
  }

  if (typeof files === "string") {
    return files
      .split(/[\n,;]+/)
      .map((fileName) => fileName.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeExternalFileName(fileName: string) {
  const normalizedName = fileName.trim().replace(/\\/g, "/");
  if (!normalizedName || normalizedName.includes("../") || normalizedName.startsWith("/")) {
    return null;
  }

  const extension = path.extname(normalizedName).toLowerCase();
  if (!allowedImageExtensions.has(extension)) {
    return null;
  }

  const nameOnly = normalizedName.split("/").filter(Boolean).pop() ?? "";
  const key = normalizeMediaKey(nameOnly.replace(/\.[^.]+$/, ""));
  if (!key) {
    return null;
  }

  return {
    key,
    fileName: nameOnly,
    pathName: normalizedName
      .split("/")
      .filter(Boolean)
      .map((segment) => encodeURIComponent(segment))
      .join("/"),
    mimeType: inferMimeType(nameOnly)
  };
}

function normalizeBaseUrl(baseUrl: string) {
  const trimmed = baseUrl.trim();
  if (!trimmed) {
    throw new Error("URL de base obligatoire.");
  }

  if (!trimmed.startsWith("https://") && !trimmed.startsWith("http://")) {
    throw new Error("URL de base invalide. Utilisez une URL http(s).");
  }

  const parsed = new URL(trimmed);
  parsed.hash = "";
  parsed.search = "";
  if (!parsed.pathname.endsWith("/")) {
    parsed.pathname = `${parsed.pathname}/`;
  }

  return parsed.toString();
}

function buildExternalAssetUrl(baseUrl: string, filePath: string) {
  return new URL(filePath, baseUrl).toString();
}

function readGithubRepository(repository: string) {
  const value = repository.trim();
  if (!value) {
    throw new Error("Depot GitHub obligatoire.");
  }

  const withoutProtocol = value
    .replace(/^https?:\/\/github\.com\//i, "")
    .replace(/\.git$/i, "")
    .replace(/^\/+|\/+$/g, "");
  const [owner, repo, ...rest] = withoutProtocol.split("/");
  if (!owner || !repo || rest.length) {
    throw new Error("Depot GitHub invalide. Utilisez owner/repo.");
  }

  return {
    owner,
    repo,
    fullName: `${owner}/${repo}`
  };
}

function normalizeGithubDirectory(directory: string | undefined) {
  const value = (directory ?? "").trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  if (!value || value === ".") {
    return "";
  }

  if (value.includes("../")) {
    throw new Error("Dossier GitHub invalide.");
  }

  return value;
}

function buildGithubContentsUrl(repository: ReturnType<typeof readGithubRepository>, directory: string, branch: string) {
  const pathSegment = directory
    ? `/${directory.split("/").filter(Boolean).map((segment) => encodeURIComponent(segment)).join("/")}`
    : "";
  return `https://api.github.com/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.repo)}/contents${pathSegment}?ref=${encodeURIComponent(branch)}`;
}

function isAllowedImageFile(filePath: string) {
  return allowedImageExtensions.has(path.extname(filePath).toLowerCase());
}

async function listGithubImageFiles(input: MediaAssetGithubImportInput) {
  const repository = readGithubRepository(input.repository ?? "");
  const branch = (input.branch ?? "main").trim() || "main";
  const directory = normalizeGithubDirectory(input.directory);
  const response = await fetch(buildGithubContentsUrl(repository, directory, branch), {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "pressero-pjm-visual-middleware",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub a refuse la lecture du depot (${response.status}).`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error("Le chemin GitHub doit pointer vers un dossier.");
  }

  const files = payload
    .filter((entry: GithubContentEntry) => entry.type === "file")
    .map((entry: GithubContentEntry) => {
      if (typeof entry.path === "string") return entry.path;
      if (typeof entry.name === "string") return directory ? `${directory}/${entry.name}` : entry.name;
      return "";
    })
    .filter((filePath: string) => filePath && isAllowedImageFile(filePath));

  return {
    files,
    scanned: payload.length,
    source: {
      repository: repository.fullName,
      branch,
      directory
    }
  };
}

export async function importMediaAssetsZip(
  buffer: Buffer
): Promise<MediaAssetZipImportResult> {
  if (!buffer.length) {
    throw new Error("Archive ZIP vide.");
  }

  await mkdir(env.media.assetsDir, {
    recursive: true
  });

  const zip = new AdmZip(buffer);
  const items: MediaAssetZipImportResult["items"] = [];
  const seenKeys = new Set<string>();

  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) {
      continue;
    }

    const originalFileName = readZipEntryFileName(entry.entryName);
    if (!originalFileName) {
      items.push({
        fileName: entry.entryName,
        key: "",
        url: "",
        status: "skipped",
        reason: "Nom de fichier invalide."
      });
      continue;
    }

    const normalized = normalizeStoredFileName(originalFileName);
    if (!normalized) {
      items.push({
        fileName: originalFileName,
        key: "",
        url: "",
        status: "skipped",
        reason: "Extension non supportee."
      });
      continue;
    }

    if (seenKeys.has(normalized.key)) {
      items.push({
        fileName: originalFileName,
        key: normalized.key,
        url: "",
        status: "skipped",
        reason: "Doublon dans le ZIP."
      });
      continue;
    }
    seenKeys.add(normalized.key);

    const data = entry.getData();
    const targetPath = path.join(env.media.assetsDir, normalized.fileName);
    const url = `${publicMediaAssetsPath}/${normalized.fileName}`;
    const existing = await prisma.mediaAsset.findUnique({
      where: {
        key: normalized.key
      }
    });

    await writeFile(targetPath, data);
    await prisma.mediaAsset.upsert({
      where: {
        key: normalized.key
      },
      create: {
        key: normalized.key,
        fileName: normalized.fileName,
        mimeType: normalized.mimeType,
        url,
        altText: originalFileName.replace(/\.[^.]+$/, ""),
        byteSize: data.length
      },
      update: {
        fileName: normalized.fileName,
        mimeType: normalized.mimeType,
        url,
        byteSize: data.length
      }
    });

    items.push({
      fileName: originalFileName,
      key: normalized.key,
      url,
      status: existing ? "updated" : "created"
    });
  }

  return {
    imported: items.filter((item) => item.status !== "skipped").length,
    skipped: items.filter((item) => item.status === "skipped").length,
    items
  };
}

export async function importMediaAssetsFromUrls(
  input: MediaAssetUrlImportInput
): Promise<MediaAssetUrlImportResult> {
  const baseUrl = normalizeBaseUrl(input.baseUrl ?? "");
  const files = readUrlImportFiles(input.files);
  if (!files.length) {
    throw new Error("Liste de fichiers obligatoire.");
  }

  const items: MediaAssetUrlImportResult["items"] = [];
  const seenKeys = new Set<string>();

  for (const fileName of files) {
    const normalized = normalizeExternalFileName(fileName);
    if (!normalized) {
      items.push({
        fileName,
        key: "",
        url: "",
        status: "skipped",
        reason: "Nom de fichier ou extension invalide."
      });
      continue;
    }

    if (seenKeys.has(normalized.key)) {
      items.push({
        fileName,
        key: normalized.key,
        url: "",
        status: "skipped",
        reason: "Doublon dans la liste."
      });
      continue;
    }
    seenKeys.add(normalized.key);

    const url = buildExternalAssetUrl(baseUrl, normalized.pathName);
    const existing = await prisma.mediaAsset.findUnique({
      where: {
        key: normalized.key
      }
    });

    await prisma.mediaAsset.upsert({
      where: {
        key: normalized.key
      },
      create: {
        key: normalized.key,
        fileName: normalized.fileName,
        mimeType: normalized.mimeType,
        url,
        altText: normalized.fileName.replace(/\.[^.]+$/, "")
      },
      update: {
        fileName: normalized.fileName,
        mimeType: normalized.mimeType,
        url
      }
    });

    items.push({
      fileName,
      key: normalized.key,
      url,
      status: existing ? "updated" : "created"
    });
  }

  return {
    imported: items.filter((item) => item.status !== "skipped").length,
    skipped: items.filter((item) => item.status === "skipped").length,
    items
  };
}

export async function importMediaAssetsFromGithub(
  input: MediaAssetGithubImportInput
): Promise<MediaAssetGithubImportResult> {
  const github = await listGithubImageFiles(input);
  if (!github.files.length) {
    throw new Error("Aucune image compatible trouvee dans ce dossier GitHub.");
  }

  const result = await importMediaAssetsFromUrls({
    baseUrl: input.baseUrl,
    files: github.files
  });

  return {
    ...result,
    scanned: github.scanned,
    source: github.source
  };
}
