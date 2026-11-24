import { clerkMiddleware } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Clerk only reads its session here; no route is protected, since the demo
// logins stay public. Without the Clerk keys the proxy does nothing.
export default process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? clerkMiddleware() : () => NextResponse.next()

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
