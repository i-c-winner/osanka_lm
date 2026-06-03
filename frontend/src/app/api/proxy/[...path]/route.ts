import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
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

  const body = ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer();

  // redirect: "follow" — следуем за 307 сами, браузер не видит редиректов
  const res = await fetch(url, {
    method: req.method,
    headers,
    body,
    redirect: "follow",
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
