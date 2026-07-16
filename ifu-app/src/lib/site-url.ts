const DEFAULT_SITE_URL = "https://dev.d34plke7xvuysn.amplifyapp.com";

export function getSiteUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_BASE_URL ?? DEFAULT_SITE_URL;

  try {
    const url = new URL(rawUrl);
    url.pathname = "";
    url.search = "";
    url.hash = "";

    return url.toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function getAbsoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${getSiteUrl()}${normalizedPath}`;
}
