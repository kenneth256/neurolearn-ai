import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  // www to non-www redirect
  if (url.hostname.startsWith('www.')) {
    const newHostname = url.hostname.replace(/^www\./, '');
    const newUrl = new URL(url.pathname + url.search, `https://${newHostname}`);
    return NextResponse.redirect(newUrl);
  }

  const authRoutes = ["/", "/login", "/register"];


  if (token && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }


  if (!token && !authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: [

    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};