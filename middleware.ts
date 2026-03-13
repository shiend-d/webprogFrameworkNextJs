import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

function isApiRoute(pathname: string) {
  return pathname.startsWith("/api/");
}

function isPublicApiRoute(pathname: string) {
  return pathname === "/api/auth/login" || pathname === "/api/auth/logout";
}

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (isPublicApiRoute(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("admin_token")?.value;
  const validToken = token ? verifyToken(token) : null;

  if (!validToken) {
    if (isApiRoute(pathname)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const runtime = "nodejs";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/produk/:path*",
    "/keuangan/:path*",
    "/bahan-baku/:path*",
    "/api/:path*",
  ],
};
