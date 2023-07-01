import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

// export const config = {
//   matcher: ["/login", "/register", "/:path*"],
// };

const checkIsAuthPage = (url: string) => {
  return url.startsWith("/login") || url.startsWith("/register");
};

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });
    const hasAuth = !!token;
    const nextPath = req.nextUrl.pathname;
    console.log("nextPath", nextPath);

    const isAuthPage = checkIsAuthPage(nextPath);

    // 如果已经登录并且访问的是登录或注册页面，跳转到主页
    if (hasAuth && isAuthPage) {
      return NextResponse.redirect(new URL("/main", req.url));
    }

    if (!hasAuth) {
      let from = nextPath;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(from)}`, req.url));
    }

    if (nextPath === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      async authorized(req) {
        // This is a work-around for handling redirect on auth pages.
        // We return true here so that the middleware function above
        // is always called.
        return true;
      },
    },
  },
);
