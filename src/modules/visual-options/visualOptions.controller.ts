import type { Request, Response } from "express";

export function getVisualOptionsStatus(_req: Request, res: Response) {
  res.status(501).json({
    module: "visual-options",
    status: "not_implemented",
    sprint: 1
  });
}
