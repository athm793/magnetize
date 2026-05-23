import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/", "/login", "/signup", "/p/"];
const publicApiPaths = ["/api/auth", "/api/leads", "/api/analytics"];

// NextAuth wraps this handler — export as both named "proxy" and default for Next.js 16 compatibility
export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  // Custom domain: if host differs from the app URL, rewrite to /p/[slug] lookup
  const host = req.headers.get("host") ?? "";
  const appHost = (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/^https?:\/\//, "");
  if (host && appHost && host !== appHost && !host.includes("localhost") && !host.includes("vercel")) {
    const url = req.nextUrl.clone();
    url.pathname = `/_domain${pathname}`;
    url.searchParams.set("domain", host);
    return NextResponse.rewrite(url);
  }

  const isPublic =
    publicPaths.some((p) => pathname.startsWith(p)) ||
    publicApiPaths.some((p) => pathname.startsWith(p));

  if (!isPublic && !req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
