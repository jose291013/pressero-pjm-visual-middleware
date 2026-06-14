import { prisma } from "../../config/prisma.js";
import { createPjmClientFromEnv } from "./pjmClient.js";
import { syncPjmCatalog } from "./pjmSyncCatalog.service.js";

try {
  const result = await syncPjmCatalog(createPjmClientFromEnv());
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
