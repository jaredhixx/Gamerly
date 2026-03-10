export const SITE_URL = "https://www.gamerly.net";

export function buildGamePath(id: number, slug: string) {
  return `/game/${id}${slug ? `-${slug}` : ""}`;
}

export function buildCanonicalUrl(path: string) {
  return `${SITE_URL}${path}`;
}