import type { Request, Response } from "express";
import {
  createPresseroProductConfig,
  deletePresseroProductConfig,
  getPresseroConfigModuleName,
  listPresseroProductConfigs,
  updatePresseroProductConfig
} from "./presseroConfig.service.js";
import type { PresseroProductConfigInput } from "./presseroConfig.types.js";

export function getPresseroConfigStatus(_req: Request, res: Response) {
  res.status(200).json({
    module: getPresseroConfigModuleName(),
    status: "product_config_foundation",
    sprint: 26
  });
}

function readConfigInput(value: unknown): PresseroProductConfigInput {
  if (typeof value !== "object" || value === null) {
    throw new Error("Request body must be an object.");
  }

  return value as PresseroProductConfigInput;
}

function readRouteParam(value: string | string[] | undefined, name: string) {
  if (typeof value !== "string") {
    throw new Error(`${name} is required.`);
  }

  return value;
}

export async function getPresseroProductConfigs(_req: Request, res: Response) {
  try {
    const configs = await listPresseroProductConfigs();
    res.status(200).json({ data: configs });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
}

export async function postPresseroProductConfig(req: Request, res: Response) {
  try {
    const config = await createPresseroProductConfig(readConfigInput(req.body));
    res.status(201).json({ data: config });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
}

export async function putPresseroProductConfig(req: Request, res: Response) {
  try {
    const config = await updatePresseroProductConfig(
      readRouteParam(req.params.configId, "configId"),
      readConfigInput(req.body)
    );
    res.status(200).json({ data: config });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
}

export async function deletePresseroProductConfigById(
  req: Request,
  res: Response
) {
  try {
    const result = await deletePresseroProductConfig(
      readRouteParam(req.params.configId, "configId")
    );
    res.status(200).json({ data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.status(400).json({ error: message });
  }
}
