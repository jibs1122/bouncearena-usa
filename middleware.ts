import { NextRequest, NextResponse } from "next/server";

// Constant-time string comparison — prevents timing oracle attacks on Basic Auth.
function timingSafeEqual(a: string, b: string): boolean {
  let mismatch = a.length === b.length ? 0 : 1;
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return mismatch === 0;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Strictly necessary geo-cookie for routing — no PII, no consent required
  // under ePrivacy Directive Article 5(3) strictly-necessary exemption.
  const country = request.headers.get("x-vercel-ip-country");
  if (country) {
    response.cookies.set("ba_country", country, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
      httpOnly: true,
      secure: true,
    });
  }

  // HTTP Basic Auth for /admin routes (production only)
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (process.env.NODE_ENV !== "production") {
      return response;
    }

    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPass) {
      return new NextResponse("Service unavailable", { status: 503 });
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Basic ")) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Bounce Arena Admin"' },
      });
    }

    const credentials = Buffer.from(authHeader.slice(6), "base64").toString();
    const colonIdx = credentials.indexOf(":");
    const user = colonIdx === -1 ? credentials : credentials.slice(0, colonIdx);
    const pass = colonIdx === -1 ? "" : credentials.slice(colonIdx + 1);

    if (!timingSafeEqual(user, adminUser) || !timingSafeEqual(pass, adminPass)) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Bounce Arena Admin"' },
      });
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
