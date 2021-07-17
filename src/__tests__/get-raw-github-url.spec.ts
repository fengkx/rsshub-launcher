import { getRawGithubUrl } from "../get-raw-github-url";

test("blob url", () => {
  expect(
    getRawGithubUrl(
      "https://github.com/DylanXie123/RSSHub/blob/feat/xjtu-ee/lib/routes/universities/xjtu/ee.js"
    )
  ).toBe(
    "https://raw.githubusercontent.com/DylanXie123/RSSHub/feat/xjtu-ee/lib/routes/universities/xjtu/ee.js"
  );
});

test("tree url", () => {
  expect(
    getRawGithubUrl(
      "https://github.com/hondajojo/RSSHub/tree/master/lib/routes/xiaoyuzhou/podcast.js"
    )
  ).toBe(
    "https://raw.githubusercontent.com/hondajojo/RSSHub/master/lib/routes/xiaoyuzhou/podcast.js"
  );
});

test("sha url", () => {
  expect(
    getRawGithubUrl(
      "https://github.com/hondajojo/RSSHub/blob/1230fad8e74e152729bc0856c0c3459a70e3aa69/lib/routes/xiaoyuzhou/podcast.js"
    )
  ).toBe(
    "https://raw.githubusercontent.com/hondajojo/RSSHub/1230fad8e74e152729bc0856c0c3459a70e3aa69/lib/routes/xiaoyuzhou/podcast.js"
  );
});
