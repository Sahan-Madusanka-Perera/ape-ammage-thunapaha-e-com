import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "aat_admin";

/**
 * English is served at the root and Sinhala under /si, so shoppers share clean links.
 * Internally every storefront page lives under app/[lang].
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    // Optimistic gate only; every admin page and action verifies the session itself.
    if (pathname !== "/admin/login" && !request.cookies.has(ADMIN_COOKIE)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/si" || pathname.startsWith("/si/")) return NextResponse.next();

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/|files/|api/|favicon\\.ico|icon|apple-icon|robots\\.txt|sitemap\\.xml|.*\\.[a-z0-9]+$).*)"],
};
