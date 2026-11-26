"use client"
import { useEffect, useMemo, useRef } from "react"
import { useAuth, useClerk, useUser } from "@clerk/nextjs"
import { ApiAuthProvider, type ApiAuth } from "@/lib/api/use-api"
import { GATEWAY_TOKEN_TEMPLATE, REAL_USER_PREFIX } from "@/lib/api/clerk"
import { refreshMemberships, useActiveBrand, useMarcaStore } from "@/lib/api/marca"
import type { MyBrand } from "@/lib/api/me"
import { useAuthStore } from "@/lib/stores/auth"
import { MOCK_USERS, nameInitials, type MockUser } from "@/lib/mock-data/users"

// Screens not wired to the backend yet read mock data by organization, so the
// real account keeps the first demo brand's organization id for them. Name
// and logo come from the active Marca.
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
    organizationName: "",
    orgLogo: undefined,
    plan: demoBrand?.plan,
  }
}

function withBrand(user: MockUser, brand: MyBrand | null): MockUser {
  return {
    ...user,
    organizationName: brand ? brand.branding.name || brand.name : "",
    orgLogo: brand?.branding.logoUrl || undefined,
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
      void refreshMemberships(() => getToken({ template: GATEWAY_TOKEN_TEMPLATE }))
    } else if (!isSignedIn && isRealUser(current)) {
      useAuthStore.getState().logout()
    }
    if (!isSignedIn) useMarcaStore.getState().reset()
  }, [isLoaded, isSignedIn, user, getToken])

  // The panel shows the active Marca's name and logo.
  const activeBrand = useActiveBrand()
  useEffect(() => {
    const current = useAuthStore.getState().user
    if (current && isRealUser(current)) useAuthStore.setState({ user: withBrand(current, activeBrand) })
  }, [activeBrand])

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
