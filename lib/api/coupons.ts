// The Marca's coupons as the sales service answers them: the Creators' coupons
// (sales coupon/dto/BrandCouponRow.java, BrandCouponPage.java,
// CouponCodeView.java) and the coupons already in a store
// (coupon/dto/StoreCouponListing.java, StoreCouponView.java). Pure, so it runs
// under `node --test` without Next.
import type { HttpMethod } from "./client"

// One coupon per Creator in each store; newest first, ended ones included.
export interface BrandCouponRow {
  id: string
  code: string
  // pending, active, pending_update, pending_deactivation, deactivated,
  // unsupported or failed.
  state: string
  discountPercent: number
  connectionId: string
  platform: string
  linkId: string
  creatorId: string
  linkEndedAt: string | null
  createdAt: string
}

export interface BrandCouponPage {
  items: BrandCouponRow[]
  nextCursor: string | null
}

export interface CouponCodeView {
  couponId: string
  code: string
  state: string
}

export type StoreDiscountType = "percentage" | "fixed" | "free_shipping" | "other"

// percentage: value in % (may be decimal); fixed: value in cents;
// free_shipping and other: value null.
export interface StoreDiscount {
  type: StoreDiscountType | string
  value: number | null
}

export interface StoreCouponView {
  code: string
  externalId: string
  discount: StoreDiscount
  active: boolean
  startsAt: string | null
  endsAt: string | null
  usageCount: number | null
  // The platform coupon (GET /coupons) with this code in this store.
  managedCouponId: string | null
}

// supported false: the platform cannot list coupons; items is empty.
export interface StoreCouponListing {
  supported: boolean
  items: StoreCouponView[]
  nextCursor: string | null
}

export const MARCA_COUPONS = "/v1/sales/marca/coupons"

type Request = <T>(method: HttpMethod, path: string, body?: unknown) => Promise<T>

function withPage(path: string, cursor?: string | null, limit?: number) {
  const params = new URLSearchParams()
  if (cursor) params.set("cursor", cursor)
  if (limit !== undefined) params.set("limit", String(limit))
  const search = params.toString()
  return search ? `${path}?${search}` : path
}

export function couponsPath(cursor?: string | null, limit?: number) {
  return withPage(MARCA_COUPONS, cursor, limit)
}

export function storeCouponsPath(connectionId: string, cursor?: string | null, limit?: number) {
  return withPage(`/v1/sales/marca/connections/${encodeURIComponent(connectionId)}/store-coupons`, cursor, limit)
}

export async function listCoupons(request: Request, cursor?: string | null): Promise<BrandCouponPage> {
  const page = await request<BrandCouponPage>("GET", couponsPath(cursor))
  return { items: page?.items ?? [], nextCursor: page?.nextCursor ?? null }
}

export function updateCouponCode(request: Request, couponId: string, code: string) {
  return request<CouponCodeView>("PUT", `${MARCA_COUPONS}/${encodeURIComponent(couponId)}/code`, { code })
}

export async function listStoreCoupons(request: Request, connectionId: string, cursor?: string | null): Promise<StoreCouponListing> {
  const page = await request<StoreCouponListing>("GET", storeCouponsPath(connectionId, cursor))
  return { supported: page?.supported ?? false, items: page?.items ?? [], nextCursor: page?.nextCursor ?? null }
}
