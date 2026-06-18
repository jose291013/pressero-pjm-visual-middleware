import "dotenv/config";
import path from "node:path";

const DEFAULT_PORT = 3000;

function readPort(value: string | undefined): number {
  if (!value) return DEFAULT_PORT;

  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${value}`);
  }

  return port;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: readPort(process.env.PORT),
  databaseUrl: process.env.DATABASE_URL,
  media: {
    assetsDir:
      process.env.MEDIA_ASSETS_DIR?.trim() ||
      path.join(process.cwd(), "src", "public", "media", "assets")
  },
  pjm: {
    publicBaseUrl: process.env.PJM_PUBLIC_BASE_URL,
    username: process.env.PJM_USERNAME,
    password: process.env.PJM_PASSWORD
  }
};
