import { posix } from "path";
import { writeFile } from "fs/promises";

const { join } = posix;
export async function patchRouterJs(
  routePath: string,
  requirePath: string,
  RSSHUB_BASE_DIR: string
): Promise<void> {
  const routerjsPath = join(RSSHUB_BASE_DIR, "lib", "router.js");
  await writeFile(
    routerjsPath,
    `router.get('${routePath}', require('${requirePath}'));\n`,
    { encoding: "utf-8", flag: "a+" }
  );
}
