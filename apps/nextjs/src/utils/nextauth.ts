import { authMiddleware } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { i18n } from "~/config/i18n-config";

// 公共路由列表
const publicRoute = [
  "/",
  "/sign-in",
  "/sign-up",
  "/terms",
  "/privacy",
  "/zh",
  "/zh/sign-in",
  "/zh/sign-up",
  "/zh/terms",
  "/zh/privacy",
  "/en",
  "/en/sign-in",
  "/en/sign-up",
  "/en/terms",
  "/en/privacy",
  "/signin(.*)",
  "/terms(.*)",
  "/privacy(.*)",
  "/docs(.*)",
  "/blog(.*)",
  "/pricing(.*)",
  "/image-to-prompt(.*)",
  "/zh/signin(.*)",
  "/zh/terms(.*)",
  "/zh/privacy(.*)",
  "/zh/docs(.*)",
  "/zh/blog(.*)",
  "/zh/pricing(.*)",
  "/zh/image-to-prompt(.*)",
  "/en/signin(.*)",
  "/en/terms(.*)",
  "/en/privacy(.*)",
  "/en/docs(.*)",
  "/en/blog(.*)",
  "/en/pricing(.*)",
  "/en/image-to-prompt(.*)"
];

// 无需处理的路由
const noNeedProcessRoute = [
  "/images/(.*)",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/_next/(.*)",
  "/static/(.*)"
];

// 无需重定向的路由
const noRedirectRoute = ["/api(.*)", "/trpc(.*)", "/admin(.*)"];

function getLocale(request: NextRequest): string | undefined {
  // Negotiator expects plain object so we need to transform headers
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
  const locales = Array.from(i18n.locales);
  // Use negotiator and intl-localematcher to get best locale
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales,
  );
  return matchLocale(languages, locales, i18n.defaultLocale);
}

export function isNoRedirect(pathname: string): boolean {
  return noRedirectRoute.some((route) => new RegExp(route).test(pathname));
}

export function isPublicPage(pathname: string): boolean {
  return publicRoute.some((route) => new RegExp(route).test(pathname));
}

export function isNoNeedProcess(pathname: string): boolean {
  return noNeedProcessRoute.some((route) => new RegExp(route).test(pathname));
}

export default authMiddleware({
  publicRoutes: publicRoute,
  ignoredRoutes: noNeedProcessRoute,
});
