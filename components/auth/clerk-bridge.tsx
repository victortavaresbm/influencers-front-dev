"use client"
import { useEffect, useMemo, useRef } from "react"
import { useAuth, useClerk, useUser } from "@clerk/nextjs"
import { ApiAuthProvider, type ApiAuth } from "@/lib/api/use-api"
import { GATEWAY_TOKEN_TEMPLATE, REAL_USER_PREFIX } from "@/lib/api/clerk"
import { useAuthStore } from "@/lib/stores/auth"
import { MOCK_USERS, nameInitials, type MockUser } from "@/lib/mock-data/users"

// Screens not wired to the backend yet read mock data by organization, so the
// real account borrows the first demo brand's organization for them.
const demoBrand = MOCK_USERS.find((user) => user.role === "brand")

function toBrandUser(id: string, name: string, email: string, photo?: string): MockUser {
  return {
    id: REAL_USER_PREFIX + id,
    email,
    password: "",
    role: "brand",
    name,
    avatar: nameInitials(name),
    photo,
    organizationId: demoBrand?.organizationId ?? "org1",
    organizationName: demoBrand?.organizationName ?? "",
    orgLogo: demoBrand?.orgLogo,
    plan: demoBrand?.plan,
  }
}

export function isRealUser(user: MockUser | null | undefined) {
  return Boolean(user?.id.startsWith(REAL_USER_PREFIX))
}

// Mirrors the Clerk session into the demo auth store, so the existing
// layouts accept the real account, and hands its token to useApi.
export function ClerkBridge({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth()
  const { user } = useUser()
  const { signOut } = useClerk()
  const wasSignedIn = useRef<boolean | undefined>(undefined)

  useEffect(() => {
    if (!isLoaded) return
    const was = wasSignedIn.current
    wasSignedIn.current = isSignedIn
    const current = useAuthStore.getState().user
    if (isSignedIn && user && (was !== true || !current)) {
      const name = user.fullName || user.username || user.primaryEmailAddress?.emailAddress || "Conta"
      useAuthStore.setState({
        user: toBrandUser(user.id, name, user.primaryEmailAddress?.emailAddress ?? "", user.imageUrl),
      })
    } else if (!isSignedIn && isRealUser(current)) {
      useAuthStore.getState().logout()
    }
  }, [isLoaded, isSignedIn, user])

  // The app's logout clears the store; end the Clerk session with it.
  useEffect(
    () =>
      useAuthStore.subscribe((state, previous) => {
        if (isRealUser(previous.user) && !state.user) void signOut()
      }),
    [signOut]
  )

  const auth = useMemo<ApiAuth>(
    () => ({
      signedIn: Boolean(isSignedIn),
      getToken: () => (isSignedIn ? getToken({ template: GATEWAY_TOKEN_TEMPLATE }) : Promise.resolve(null)),
    }),
    [isSignedIn, getToken]
  )

  return <ApiAuthProvider value={auth}>{children}</ApiAuthProvider>
}
