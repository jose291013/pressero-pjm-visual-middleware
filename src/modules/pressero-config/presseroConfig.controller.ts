import type { Request, Response } from "express";

export function getPresseroConfigStatus(_req: Request, res: Response) {
  res.status(501).json({
    module: "pressero-config",
    status: "not_implemented",
    sprint: 1
  });
}
