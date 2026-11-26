// The identity's me class: the Marcas the real account is a Member of and the
// pending invitations to its e-mail. Pure functions, so they run under
// `node --test` without Next.
import { apiFetch, isMarcaId, type ApiContext } from "./client"

export interface Branding {
  name: string
  logoUrl: string
  primaryColor: string
}

export interface MyBrand {
  id: string
  name: string
  address: string
  branding: Branding
  role: "owner" | "manager"
  modules: string[]
  suspended: boolean
}

export interface MyInvitation {
  id: string
  role: "owner" | "manager"
  invitedAt: string
  brand: { id: string; name: string; address: string; branding: Branding }
}

export const ME_BRANDS = "/v1/identity/me/brands"
export const ME_INVITATIONS = "/v1/identity/me/members/invitations"

export function acceptInvitationPath(id: string) {
  return `${ME_INVITATIONS}/${encodeURIComponent(id)}/accept`
}

// The me class needs no Marca: these calls never send X-Marca-Id.
export async function loadMemberships(ctx: ApiContext, fetchImpl: typeof fetch = fetch) {
  const noMarca = { ...ctx, marcaId: null }
  const [brands, invitations] = await Promise.all([
    apiFetch<{ brands: MyBrand[] }>(noMarca, "GET", ME_BRANDS, undefined, fetchImpl),
    apiFetch<{ invitations: MyInvitation[] }>(noMarca, "GET", ME_INVITATIONS, undefined, fetchImpl),
  ])
  return { brands: brands.brands ?? [], invitations: invitations.invitations ?? [] }
}

export function acceptInvitation(ctx: ApiContext, id: string, fetchImpl: typeof fetch = fetch) {
  return apiFetch<unknown>({ ...ctx, marcaId: null }, "POST", acceptInvitationPath(id), undefined, fetchImpl)
}

// pickMarca chooses the active Marca: the only one, or the last used while it
// is still in the list. null means the account picks one (or has none). The
// last used is only a browser preference: it never wins over the list.
export function pickMarca(brands: readonly Pick<MyBrand, "id">[], lastUsed: string | null | undefined): string | null {
  if (brands.length === 1) return brands[0].id.toLowerCase()
  if (!isMarcaId(lastUsed)) return null
  const last = lastUsed.toLowerCase()
  return brands.some((brand) => brand.id.toLowerCase() === last) ? last : null
}
