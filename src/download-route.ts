import { logger } from "./logger.js";
import { resolveFile } from "./resolve-file.js";
import { patchRouterJs } from "./patch-router-js.js";
import { got } from "./got.js";
import { posix as path } from "path";
import parseDiff from "parse-diff";
import { parse as parseAst } from "acorn";
import { strict as assert } from "assert";
export type RouteInfo = {
  remoteUrl: string;
  routePath: string;
};

export type PrConfig = {
  prUrl: string;
};
export type RouteConfig = RouteInfo | PrConfig;

// export function isPrConfig(config: RouteConfig):  is PrConfig {
//     return Boolean(config.prUrl);
// }

const commitRgex = /([a-f0-9]{40})/gm;
export async function getRouteInfoFromPr({
  prUrl,
}: PrConfig): Promise<RouteInfo[]> {
  const url = new URL(prUrl);
  if (
    url.origin !== "https://github.com" &&
    !url.pathname.startsWith("/DIYgod/RSSHub/pull")
  )
    throw new TypeError(
      "Should provided a url `https://github.com/DIYgod/RSSHub/pull`"
    );
  const patchUrl = prUrl + ".patch";
  const patchContent = await got(patchUrl).text();
  const matched = patchContent.match(commitRgex);
  if (!matched) {
    throw new TypeError("Patch parse failed");
  }
  const latestCommit = matched[matched?.length - 1];
  const routes = getRoutesFromPatch(patchContent);
  return routes.map((route) => {
    const { routePath } = route;
    // github can access any fork's commit through original repo
    const urlTpl = new URL(
      `https://github.com/DIYgod/RSSHub/blob/${latestCommit}/`
    );
    urlTpl.pathname = path.join(
      urlTpl.pathname,
      "lib",
      `${route.requirePath}.js`
    );
    const remoteUrl = urlTpl.toString();
    return { routePath, remoteUrl };
  });
}

export function getRoutesFromPatch(
  patch: string
): { routePath: string; requirePath: string }[] {
  const files = parseDiff(patch);
  const addedLines: string[] = [];
  files
    .find((f) => f.from === "lib/router.js")
    ?.chunks.forEach((chunk) => {
      chunk.changes
        .filter(
          (change) =>
            change.type === "add" && change.content.startsWith("+router.get")
        )
        .forEach((change) => addedLines.push(change.content.substring(1)));
    });
  return addedLines.map((src) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ast = parseAst(src, { ecmaVersion: "latest" }) as any;
    assert.equal(ast.type, "Program");
    const routerRegisterExpr = ast.body[0].expression;
    const { callee, arguments: callArguments } = routerRegisterExpr;
    assert.equal(callee.type, "MemberExpression");
    const { object, property } = callee;
    assert.equal(object.name, "router");
    assert.equal(property.name, "get");
    const routePath = callArguments[0].value;
    const requirePath = callArguments[1].arguments[0].value;
    return { routePath, requirePath };
  });
}

export async function downloadRoute(
  remoteUrl: string,
  routePath: string,
  RSSHUB_ROOT_DIR: string,
  override: boolean
): Promise<void> {
  const { pathname } = new URL(remoteUrl);
  const pathSep = pathname.split("/");
  const startIndex = pathSep.findIndex((p) => p === "routes");
  const requirePath = `./${pathSep.slice(startIndex).join("/")}`;
  await Promise.all([
    resolveFile(remoteUrl, RSSHUB_ROOT_DIR, override),

    patchRouterJs(routePath, requirePath, RSSHUB_ROOT_DIR),
  ]);
  logger.success(
    `Successfully download ${remoteUrl} to ${requirePath} as route: ${routePath}`
  );
}
