import type { Request, Response } from "express";

export function getMediaLibraryStatus(_req: Request, res: Response) {
  res.status(501).json({
    module: "media-library",
    status: "not_implemented",
    sprint: 1
  });
}
