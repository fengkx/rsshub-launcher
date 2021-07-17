import { parseModulePath } from "../parse-module-path";

test("parse module", () => {
  const src = `const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');`;
  expect(parseModulePath(src)).toEqual([
    { path: "@/utils/got" },
    { path: "cheerio" },
    { path: "@/utils/parse-date" },
    { path: "@/utils/timezone" },
  ]);
});
