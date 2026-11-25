// The real login exists only when the Clerk keys are set; without them the
// app stays on the demo logins.
export const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

// JWT template whose aud the gateway checks (CLERK_AUDIENCE).
export const GATEWAY_TOKEN_TEMPLATE = "gateway"

export const REAL_USER_PREFIX = "clerk:"
