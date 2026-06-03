import { NextRequest, NextResponse } from "next/server";

const BACKEND = (process.env.BACKEND_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await params;
    const pathStr = path.join("/");
    const search = req.nextUrl.search ?? "";
    const targetUrl = `${BACKEND}/api/v1/${pathStr}${search}`;

    // Собираем заголовки, исключая hop-by-hop
    const headers: Record<string, string> = {};
    req.headers.forEach((val, key) => {
      const skip = ["host", "connection", "transfer-encoding", "content-length"];
      if (!skip.includes(key.toLowerCase())) {
        headers[key] = val;
      }
    });

    const isBodyMethod = !["GET", "HEAD"].includes(req.method.toUpperCase());
    const body = isBodyMethod ? await req.text() : undefined;

    // Делаем до 5 редиректов вручную, сохраняя заголовки
    let url = targetUrl;
    let response: Response | null = null;
    for (let i = 0; i < 5; i++) {
      response = await fetch(url, {
        method: req.method,
        headers,
        body,
        redirect: "manual",
      });

      if (response.status >= 300 && response.status < 400) {
        const loc = response.headers.get("location");
        if (!loc) break;
        url = loc.startsWith("http") ? loc : `${BACKEND}${loc}`;
        continue;
      }
      break;
    }

    if (!response) {
      return NextResponse.json({ error: "No response from backend" }, { status: 502 });
    }

    const resHeaders: Record<string, string> = {};
    response.headers.forEach((val, key) => {
      const skip = ["transfer-encoding", "connection", "keep-alive"];
      if (!skip.includes(key.toLowerCase())) {
        resHeaders[key] = val;
      }
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: resHeaders,
    });

  } catch (err: unknown) {
    console.error("[proxy] error:", err);
    return NextResponse.json(
      { error: "Proxy error", detail: String(err) },
      { status: 502 },
    );
  }
}

export const GET     = handler;
export const POST    = handler;
export const PUT     = handler;
export const PATCH   = handler;
export const DELETE  = handler;
export const OPTIONS = handler;
