#! /usr/bin/env node
import yargs from "yargs";
// eslint-disable-next-line import/extensions
import { hideBin } from "yargs/helpers";
import path, { join as pathJoin } from "path";
import { logger } from "./logger.js";
import { got } from "./got.js";
import { load as loadYaml } from "js-yaml";
import { downloadRoute, RouteInfo } from "./download-route.js";
import { existsSync } from "fs";
import { readFile } from "fs/promises";

function parseRoutesConfig(configYaml: string): RouteInfo[] {
  const config = loadYaml(configYaml);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { routes } = config as unknown as any;
  if (!Array.isArray(routes))
    throw new TypeError("routes field should be array");
  const valid = routes.every(
    (route) =>
      typeof route.remoteUrl === "string" && typeof route.routePath === "string"
  );
  if (!valid) {
    throw new TypeError("route should provide remoteUrl and routePath");
  }
  return routes as RouteInfo[];
}

async function checkRSSHubRoot(RSSHUB_REPO_ROOT: string): Promise<boolean> {
  const jsonPath = pathJoin(RSSHUB_REPO_ROOT, "package.json");
  if (!existsSync(jsonPath)) return false;
  const jsonText = await readFile(jsonPath, { encoding: "utf-8" });
  const pkg = JSON.parse(jsonText);
  return pkg.name === "rsshub";
}

(async function () {
  try {
    const argv = yargs(hideBin(process.argv)).positional("root", {
      type: "string",
      description: "File Path to RSSHub repository root",
      default: path.resolve("."),
    }).argv;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const root = (argv as any).root;
    const isRootValid = await checkRSSHubRoot(root);
    if (!isRootValid) {
      logger.error(
        "You should run the launcher in RSSHub repository root directory or provide a path"
      );
      return;
    }
    if (!process.env["RSSHUB_LAUNCHER_CONFIG_URL"]) {
      logger.error(
        "`RSSHUB_LAUNCHER_CONFIG_URL` environment variable should provided"
      );
      return;
    }
    const configUrl = process.env["RSSHUB_LAUNCHER_CONFIG_URL"];
    const configYaml = await got(configUrl).text();
    const routes = parseRoutesConfig(configYaml);
    await Promise.all(
      routes.map(async (route) => {
        await downloadRoute(route.remoteUrl, route.routePath, root);
      })
    );
  } catch (err) {
    logger.error(err);
  }
})();
