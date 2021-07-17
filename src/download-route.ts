import { logger } from "./logger.js";
import { resolveFile } from "./resolve-file.js";
import { patchRouterJs } from "./patch-router-js.js";
export type RouteInfo = {
  remoteUrl: string;
  routePath: string;
};

export async function downloadRoute(
  remoteUrl: string,
  routePath: string,
  RSSHUB_ROOT_DIR: string
): Promise<void> {
  const { pathname } = new URL(remoteUrl);
  const pathSep = pathname.split("/");
  const startIndex = pathSep.findIndex((p) => p === "routes");
  const requirePath = `./${pathSep.slice(startIndex).join("/")}`;
  await Promise.all([
    resolveFile(remoteUrl, RSSHUB_ROOT_DIR),

    patchRouterJs(routePath, requirePath, RSSHUB_ROOT_DIR),
  ]);
  logger.success(
    `Successfully download ${remoteUrl} to ${requirePath} as route: ${routePath}`
  );
}
