import { Router } from "express";
import {
  deleteAdminMediaAsset,
  getAdminMediaAssets,
  getMediaLibraryStatus,
  postAdminMediaAsset,
  putAdminMediaAsset
} from "./mediaLibrary.controller.js";

export const mediaLibraryRouter = Router();

mediaLibraryRouter.get("/", getMediaLibraryStatus);
mediaLibraryRouter.get("/admin/assets", getAdminMediaAssets);
mediaLibraryRouter.post("/admin/assets", postAdminMediaAsset);
mediaLibraryRouter.put("/admin/assets/:assetId", putAdminMediaAsset);
mediaLibraryRouter.delete("/admin/assets/:assetId", deleteAdminMediaAsset);
