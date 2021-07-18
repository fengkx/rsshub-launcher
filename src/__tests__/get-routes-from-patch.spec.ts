import { getRoutesFromPatch } from "../download-route";
import { readFile } from "fs/promises";

test("get routes from patch", async () => {
  const patch = await readFile(`${__dirname}/__fixtures__/patch`, {
    encoding: "utf-8",
  });
  expect(getRoutesFromPatch(patch)).toEqual([
    { routePath: "/kge/:userid", requirePath: "./routes/kge/user" },
    { routePath: "/kge/reply/:playid", requirePath: "./routes/kge/reply" },
  ]);
});
