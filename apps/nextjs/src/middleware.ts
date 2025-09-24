import { NextRequest, NextResponse } from "next/server";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { getToken } from "next-auth/jwt";
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
  "/en/image-to-prompt(.*)",
  "/login(.*)",
  "/zh/login(.*)",
  "/en/login(.*)",
  "/api/auth(.*)"
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

function isNoRedirect(pathname: string): boolean {
  return noRedirectRoute.some((route) => new RegExp(route).test(pathname));
}

function isPublicPage(pathname: string): boolean {
  return publicRoute.some((route) => new RegExp(route).test(pathname));
}

function isNoNeedProcess(pathname: string): boolean {
  return noNeedProcessRoute.some((route) => new RegExp(route).test(pathname));
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // 跳过不需要处理的路由
  if (isNoNeedProcess(pathname)) {
    return NextResponse.next();
  }

  // 处理 Webhooks
  const isWebhooksRoute = pathname.startsWith("/api/webhooks/");
  if (isWebhooksRoute) {
    return NextResponse.next();
  }

  // 检查是否缺少语言环境
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // 如果缺少语言环境，进行重定向
  if (!isNoRedirect(pathname) && pathnameIsMissingLocale) {
    const locale = getLocale(req);
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
        req.url
      )
    );
  }

  // 公共页面直接通过
  if (isPublicPage(pathname)) {
    return NextResponse.next();
  }

  // 获取 NextAuth 会话
  const token = await getToken({ req });
  const isAuth = !!token;
  const isAdmin = token?.isAdmin === true;
  const locale = getLocale(req);

  // 处理 API 路由
  const isAuthRoute = pathname.startsWith("/api/trpc/");
  if (isAuthRoute && isAuth) {
    return NextResponse.next();
  }

  // 处理管理员路由
  if (pathname.startsWith("/admin/dashboard")) {
    if (!isAuth || !isAdmin)
      return NextResponse.redirect(new URL(`/admin/login`, req.url));
    return NextResponse.next();
  }

  // 处理认证页面
  const isAuthPage = /^\/[a-zA-Z]{2,}\/(login|register)/.test(pathname);
  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
    }
    return NextResponse.next();
  }

  // 处理未认证访问
  if (!isAuth) {
    let from = pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }
    return NextResponse.redirect(
      new URL(`/${locale}/login?from=${encodeURIComponent(from)}`, req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"
  ],
};
