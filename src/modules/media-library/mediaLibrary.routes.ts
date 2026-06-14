import { Router } from "express";
import { getMediaLibraryStatus } from "./mediaLibrary.controller.js";

export const mediaLibraryRouter = Router();

mediaLibraryRouter.get("/", getMediaLibraryStatus);
