import type { Request, Response } from "express";

export function getNegotiatedPricesStatus(_req: Request, res: Response) {
  res.status(501).json({
    module: "negotiated-prices",
    status: "not_implemented",
    sprint: 1
  });
}
