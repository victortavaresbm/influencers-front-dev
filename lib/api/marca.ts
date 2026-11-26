"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { ApiError } from "@/lib/api/client"
import { loadMemberships, pickMarca, type MyBrand, type MyInvitation } from "@/lib/api/me"

// The real account's Marcas, loaded from the identity after login. Only the
// last used Marca is kept in the browser, as a preference: the active one is
// always checked against the list.
type Status = "idle" | "loading" | "ready" | "error"

interface MarcaState {
  status: Status
  // The last load failure, kept to show why the panel did not open.
  error: unknown
  brands: MyBrand[]
  invitations: MyInvitation[]
  marcaId: string | null
  lastUsed: string | null
  loading: () => void
  failed: (error: unknown) => void
  loaded: (brands: MyBrand[], invitations: MyInvitation[]) => void
  select: (id: string) => boolean
  reset: () => void
}

export const useMarcaStore = create<MarcaState>()(
  persist(
    (set, get) => ({
      status: "idle",
      error: null,
      brands: [],
      invitations: [],
      marcaId: null,
      lastUsed: null,
      loading: () => set({ status: "loading", error: null }),
      failed: (error) => set({ status: "error", error }),
      loaded: (brands, invitations) => {
        const marcaId = pickMarca(brands, get().lastUsed)
        set({ status: "ready", brands, invitations, marcaId, lastUsed: marcaId ?? get().lastUsed })
      },
      select: (id) => {
        const next = id.toLowerCase()
        if (!get().brands.some((brand) => brand.id.toLowerCase() === next)) return false
        set({ marcaId: next, lastUsed: next })
        return true
      },
      reset: () => set({ status: "idle", error: null, brands: [], invitations: [], marcaId: null }),
    }),
    { name: "wesell-marca", partialize: (state) => ({ lastUsed: state.lastUsed }) }
  )
)

export function useActiveBrand() {
  return useMarcaStore((state) => state.brands.find((brand) => brand.id.toLowerCase() === state.marcaId) ?? null)
}

// refreshMemberships reloads the real account's Marcas and invitations. The
// me class needs only the token.
export async function refreshMemberships(getToken: () => Promise<string | null>) {
  const store = useMarcaStore.getState()
  store.loading()
  try {
    const ctx = { baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "", token: await getToken(), marcaId: null }
    const { brands, invitations } = await loadMemberships(ctx)
    useMarcaStore.getState().loaded(brands, invitations)
  } catch (err) {
    console.error("[marca] could not load the account's Marcas", err)
    useMarcaStore.getState().failed(err instanceof ApiError ? err : new ApiError(0, "unexpected_error"))
  }
}
