import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Set geo-cookie from Vercel's IP country header
  const country = request.headers.get("x-vercel-ip-country");
  if (country) {
    response.cookies.set("ba_country", country, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });
  }

  // HTTP Basic Auth for /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (process.env.NODE_ENV !== "production") {
      return response;
    }

    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPass) {
      return response;
    }

    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Basic ")) {
      return new NextResponse("Unauthorized", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="Bounce Arena Admin"' },
      });
    }

    const credentials = Buffer.from(authHeader.slice(6), "base64").toString();
    const [user, pass] = credentials.split(":");
    if (user !== adminUser || pass !== adminPass) {
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
