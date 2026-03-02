import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  // Skip Twilio API routes entirely
  if (request.nextUrl.pathname.startsWith("/api/twilio")) {
    return NextResponse.next();
  }
  // Handle CORS for widget API routes
  const isWidgetAPIRoute =
    request.nextUrl.pathname.startsWith("/api/widgets/") &&
    (request.nextUrl.pathname.includes("/status") ||
      request.nextUrl.pathname.includes("/chat") ||
      request.nextUrl.pathname.endsWith("/widgets"));

  if (isWidgetAPIRoute) {
    // Handle preflight OPTIONS request
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With",
          "Access-Control-Allow-Credentials": "false",
        },
      });
    }

    // Add CORS headers to the response
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
    response.headers.set("Access-Control-Allow-Credentials", "false");
    return response;
  }

  // Get the token with the secret
  const token = await getToken({
    req: request,
    secret: authOptions.secret,
  });

  const isAuthenticated = !!token;

  // Check if the request is for a dashboard route
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");

  // If trying to access dashboard without being authenticated
  if (isDashboardRoute && !isAuthenticated) {
    // Redirect to signin page
    const url = new URL("/signin", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/widgets/:path*"],
};
