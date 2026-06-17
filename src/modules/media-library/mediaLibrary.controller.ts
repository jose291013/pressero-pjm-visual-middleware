import type { Request, Response } from "express";
import {
  createMediaAsset,
  deleteMediaAsset,
  getMediaLibraryModuleName,
  listMediaAssets,
  updateMediaAsset
} from "./mediaLibrary.service.js";
import type { MediaAssetInput } from "./mediaLibrary.types.js";

export function getMediaLibraryStatus(_req: Request, res: Response) {
  res.status(200).json({
    module: getMediaLibraryModuleName(),
    status: "admin_library",
    sprint: 31
  });
}

function readAssetInput(value: unknown): MediaAssetInput {
  if (typeof value !== "object" || value === null) {
    throw new Error("Request body must be an object.");
  }

  return value as MediaAssetInput;
}

function readRouteParam(value: string | string[] | undefined, name: string) {
  if (typeof value !== "string") {
    throw new Error(`${name} is required.`);
  }

  return value;
}

export async function getAdminMediaAssets(req: Request, res: Response) {
  try {
    const assets = await listMediaAssets(
      typeof req.query.search === "string" ? req.query.search : ""
    );
    res.status(200).json({ data: assets });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
}

export async function postAdminMediaAsset(req: Request, res: Response) {
  try {
    const asset = await createMediaAsset(readAssetInput(req.body));
    res.status(201).json({ data: asset });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
}

export async function putAdminMediaAsset(req: Request, res: Response) {
  try {
    const asset = await updateMediaAsset(
      readRouteParam(req.params.assetId, "assetId"),
      readAssetInput(req.body)
    );
    res.status(200).json({ data: asset });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
}

export async function deleteAdminMediaAsset(req: Request, res: Response) {
  try {
    const result = await deleteMediaAsset(
      readRouteParam(req.params.assetId, "assetId")
    );
    res.status(200).json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
}
