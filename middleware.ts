import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;


  // These are accessible only when NOT logged in
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