type RequestLike = {
  headers: Headers;
  nextUrl?: {
    origin?: string;
  };
};

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || undefined;
}

export function getRequestOrigin(request: RequestLike) {
  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
  const forwardedProto = firstHeaderValue(request.headers.get("x-forwarded-proto"));
  const host = forwardedHost ?? firstHeaderValue(request.headers.get("host"));

  if (host) {
    const protocol = forwardedProto ?? (
      host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https"
    );

    return `${protocol.toLowerCase()}://${host.toLowerCase()}`;
  }

  return request.nextUrl?.origin ?? "http://localhost:3000";
}
