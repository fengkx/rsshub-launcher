export const isHttp = (urlLike: string): boolean => {
  try {
    new URL(urlLike);
    return true;
  } catch (e) {
    return false;
  }
};
