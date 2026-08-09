import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const workspaceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

config({ path: path.join(workspaceRoot, ".env") });

export { workspaceRoot };
