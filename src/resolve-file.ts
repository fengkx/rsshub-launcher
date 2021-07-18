import { posix } from "path";
import { parseModulePath } from "./parse-module-path.js";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { getRawGithubUrl, rawGitHbHost } from "./get-raw-github-url.js";
import { got } from "./got.js";
import { logger } from "./logger.js";

const { join, dirname } = posix;
export function resolveFilePathWithBase(base: string) {
  return (modulePath: string, current: string): string => {
    const AT_ABS_PATH = join(base, "lib");
    if (modulePath[0] === "@") {
      return join(AT_ABS_PATH, modulePath.substring(1));
    } else if (modulePath[0] === ".") {
      return join(current, modulePath);
    } else {
      return modulePath;
    }
  };
}

type ResolveJob = {
  url: string;
};
export async function resolveFile(
  url: string,
  RSSHUB_ROOT_DIR: string,
  override: boolean
): Promise<void> {
  const jobs: ResolveJob[] = [
    {
      url,
    },
  ];

  while (jobs.length > 0) {
    const job = jobs.shift() as ResolveJob;

    const { url } = job;
    const rawGitHubUrl = getRawGithubUrl(url);
    const { pathname } = new URL(rawGitHubUrl);
    const pathSep = pathname.split("/");
    const repoPathPrefix = pathSep.slice(0, 4);
    const pathFromRepoRoot = pathSep.slice(4);
    const destPath = join(RSSHUB_ROOT_DIR, ...pathFromRepoRoot);
    if (existsSync(destPath)) {
      if (!override) {
        logger.info(`${rawGitHubUrl} existed in ${destPath} skipped`);
        continue;
      }
      if (!destPath.includes("routes")) {
        logger.debug(
          `${rawGitHubUrl} download to ${destPath} is outside of routes folder skipped`
        );
        continue;
      }
    }
    logger.info(`Downloading ${rawGitHubUrl}`);
    const src = await got(rawGitHubUrl, { timeout: 4000 }).text();
    await mkdir(dirname(destPath), { recursive: true });
    await writeFile(destPath, src, { encoding: "utf-8" });
    const modulePaths = parseModulePath(src).map((item) => item.path);
    const resolve = resolveFilePathWithBase(RSSHUB_ROOT_DIR);
    const urlNeedResolve = modulePaths
      .filter((p) => p.includes("/")) //currently not support install extra package from npm
      .map((p) => resolve(p, dirname(destPath)))
      .map((p) => {
        return `https://${rawGitHbHost}${repoPathPrefix.join("/")}${p.replace(
          RSSHUB_ROOT_DIR,
          ""
        )}.js`;
      });
    urlNeedResolve.forEach((url) => jobs.push({ url }));
  }
}
