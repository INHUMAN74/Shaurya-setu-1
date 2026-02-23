import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const path = request.nextUrl.pathname;

  if (path.startsWith("/dashboard")) {
    if (!token) {
      const login = new URL("/login", request.url);
      login.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(login);
    }
    const role = token.role as string;
    const roleSlug =
      role === "veteran"
        ? "veteran"
        : role === "employer"
          ? "employer"
          : role === "counsellor"
            ? "counsellor"
            : "admin";
    if (path === "/dashboard" || path === "/dashboard/") {
      return NextResponse.redirect(new URL(`/dashboard/${roleSlug}`, request.url));
    }
    // Restrict access: only allow own role's dashboard paths
    const pathRole = path.startsWith("/dashboard/veteran")
      ? "veteran"
      : path.startsWith("/dashboard/employer")
        ? "employer"
        : path.startsWith("/dashboard/counsellor")
          ? "counsellor"
          : path.startsWith("/dashboard/admin")
            ? "admin"
            : null;
    if (pathRole && pathRole !== role) {
      return NextResponse.redirect(new URL(`/dashboard/${roleSlug}`, request.url));
    }
  }

  if (path === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/", "/dashboard/:path*", "/login"],
};
