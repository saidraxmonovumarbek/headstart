import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const pathname = req.nextUrl.pathname;

      if (!token) return false;

      if (pathname.startsWith("/admin") && token.role !== "admin") {
        return false;
      }

      if (pathname.startsWith("/teacher") && token.role !== "teacher") {
        return false;
      }

      return true;
    },
  },
});

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*"],
};