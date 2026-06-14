import type { Request, Response } from "express";

export function getPjmSyncStatus(_req: Request, res: Response) {
  res.status(501).json({
    module: "pjm-sync",
    status: "not_implemented",
    sprint: 1
  });
}
