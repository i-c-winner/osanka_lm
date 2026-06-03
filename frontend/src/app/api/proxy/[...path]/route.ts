import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

async function fetchWithRedirects(
  url: string,
  options: RequestInit,
  maxRedirects = 5,
): Promise<Response> {
  let currentUrl = url;
  for (let i = 0; i < maxRedirects; i++) {
    const res = await fetch(currentUrl, { ...options, redirect: "manual" });
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return res;
      // Если relative URL — делаем абсолютным
      currentUrl = location.startsWith("http")
        ? location
        : new URL(location, BACKEND).toString();
      // Сохраняем все заголовки включая Authorization
      continue;
    }
    return res;
  }
  throw new Error("Too many redirects");
}

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const search = req.nextUrl.search ?? "";
  const url = `${BACKEND}/api/v1/${pathStr}${search}`;

  const headers = new Headers();
  req.headers.forEach((val, key) => {
    if (!["host", "connection", "transfer-encoding"].includes(key)) {
      headers.set(key, val);
    }
  });

  const body =
    ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer();

  const res = await fetchWithRedirects(url, {
    method: req.method,
    headers,
    body,
  });

  const resHeaders = new Headers();
  res.headers.forEach((val, key) => {
    if (!["transfer-encoding", "connection"].includes(key)) {
      resHeaders.set(key, val);
    }
  });

  return new NextResponse(res.body, {
    status: res.status,
    headers: resHeaders,
  });
}

export const GET     = handler;
export const POST    = handler;
export const PUT     = handler;
export const PATCH   = handler;
export const DELETE  = handler;
export const OPTIONS = handler;
