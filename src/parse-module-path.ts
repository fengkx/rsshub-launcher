import { parse, Node } from "acorn";
import { simple } from "acorn-walk";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NodeWithInit = Node & { init: any };

export type ModulePath = { path: string };

export function parseModulePath(src: string): ModulePath[] {
  const requiredModules: ModulePath[] = [];
  simple(parse(src, { ecmaVersion: "latest" }), {
    VariableDeclarator(state) {
      const init = (state as NodeWithInit).init;
      if (init?.callee?.name === "require") {
        requiredModules.push({ path: init.arguments[0].value });
      }
    },
  });
  return requiredModules;
}
