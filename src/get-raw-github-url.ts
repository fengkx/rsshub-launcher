export const rawGitHbHost = "raw.githubusercontent.com";
export function getRawGithubUrl(urlString: string): string {
  const url = new URL(urlString);
  if (url.host === rawGitHbHost) return urlString;
  else if (url.host !== "github.com")
    throw new TypeError("Should provide a GitHub URL");
  else {
    const { pathname } = url;
    const pathSep = pathname.split("/").filter((i) => i.length > 0);
    pathSep.splice(2, 1);
    const result = [
      "https://raw.githubusercontent.com",
      pathSep.join("/"),
    ].join("/");
    return result;
  }
}
