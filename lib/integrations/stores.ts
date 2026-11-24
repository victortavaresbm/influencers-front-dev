// Store connections as the sales service answers them
// (sales connection/dto/ConnectionView.java), and the pure rules the
// Integrations tab applies to them.

export type ConnectionState = "pending" | "active" | "credential_error" | "disconnected"

export interface ConnectionView {
  id: string
  platform: string
  storeIdentifier: string | null
  state: ConnectionState
  createdAt: string
  lastEventAt: string | null
}

export const STORE_PLATFORMS = ["nuvemshop", "shopify"] as const
export type StorePlatform = (typeof STORE_PLATFORMS)[number]

export interface StoreCard {
  state: Exclude<ConnectionState, "disconnected"> | "not_connected"
  storeLabel: string | null
  connectionId: string | null
  // A store that refused the credential is connected again, not first.
  canConnect: boolean
}

// The latest connection that is not disconnected; a Marca keeps the history
// of old connections.
export function storeCards(connections: ConnectionView[]): Record<StorePlatform, StoreCard> {
  const cards = {} as Record<StorePlatform, StoreCard>
  for (const platform of STORE_PLATFORMS) {
    const live = connections
      .filter((c) => c.platform === platform && c.state !== "disconnected")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
    cards[platform] = live
      ? {
          state: live.state as StoreCard["state"],
          storeLabel: live.storeIdentifier,
          connectionId: live.id,
          canConnect: live.state === "credential_error",
        }
      : { state: "not_connected", storeLabel: null, connectionId: null, canConnect: true }
  }
  return cards
}

export type ConnectReturn = { ok: true; connectionId: string | null } | { ok: false; code: string }

// Reads the query the sales OAuth callback redirects back with.
export function parseConnectReturn(search: string): ConnectReturn | null {
  const params = new URLSearchParams(search)
  const status = params.get("status")
  if (status === "ok") return { ok: true, connectionId: params.get("connectionId") }
  if (status === "error") return { ok: false, code: params.get("code") || "unknown" }
  return null
}

const SHOP_NAME = /^[a-z0-9][a-z0-9-]*$/

// Accepts "loja", "loja.myshopify.com" or a pasted URL of the admin.
export function normalizeShopifyDomain(input: string): string | null {
  let value = input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "")
  if (value.endsWith(".myshopify.com")) value = value.slice(0, -".myshopify.com".length)
  return SHOP_NAME.test(value) ? `${value}.myshopify.com` : null
}

// Only an https URL leaves the app: the sales answer is trusted, but a broken
// one must never become a javascript: or http: navigation.
export function safeAuthorizeUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null
  try {
    const url = new URL(raw)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}
