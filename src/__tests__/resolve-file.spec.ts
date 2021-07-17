import { resolveFilePathWithBase } from "../resolve-file";
import { join } from "path/posix";
test("resolve file path", () => {
  const base = "/base/rsshub";
  const resolveFilePath = resolveFilePathWithBase(base);
  expect(resolveFilePath("@/utils/got", base)).toBe(
    join(base, "lib", "/utils/got")
  );
  expect(resolveFilePath("cheerio", base)).toBe("cheerio");
  expect(resolveFilePath("../test-module", join(base, "lib", "utils"))).toBe(
    join(base, "lib/utils/../test-module")
  );
});
