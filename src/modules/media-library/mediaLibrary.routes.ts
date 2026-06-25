import { Router } from "express";
import multer from "multer";
import {
  deleteAdminMediaAsset,
  getAdminMediaAssets,
  getMediaLibraryStatus,
  postAdminMediaAsset,
  postAdminMediaAssetsUrlImport,
  postAdminMediaAssetsZip,
  putAdminMediaAsset
} from "./mediaLibrary.controller.js";

export const mediaLibraryRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024
  }
});

mediaLibraryRouter.get("/", getMediaLibraryStatus);
mediaLibraryRouter.get("/admin/assets", getAdminMediaAssets);
mediaLibraryRouter.post("/admin/assets", postAdminMediaAsset);
mediaLibraryRouter.post(
  "/admin/assets/import-zip",
  upload.single("archive"),
  postAdminMediaAssetsZip
);
mediaLibraryRouter.post("/admin/assets/import-urls", postAdminMediaAssetsUrlImport);
mediaLibraryRouter.put("/admin/assets/:assetId", putAdminMediaAsset);
mediaLibraryRouter.delete("/admin/assets/:assetId", deleteAdminMediaAsset);
