// The Marca's sales as the sales service answers them
// (sales sale/dto/BrandSaleView.java and BrandSalePage.java). Pure, so it
// runs under `node --test` without Next.
import type { HttpMethod } from "./client"

export interface BrandSaleView {
  orderId: string
  // null without a Creator coupon.
  saleId: string | null
  attributed: boolean
  creatorId: string | null
  connectionId: string
  platform: string
  // The coupon used in the order, even when it is not a Creator's.
  coupon: string | null
  // unattributed, pending, consolidated, not_consolidated, partially_refunded or refunded.
  status: string
  orderState: string
  paidAt: string
  grossAmountCents: number
  discountAmountCents: number
  refundedAmountCents: number
  consolidatedAmountCents: number | null
  consolidatedAt: string | null
  refundedSaleCents: number
}

// Newest payment first; nextCursor is null on the last page.
export interface BrandSalePage {
  items: BrandSaleView[]
  nextCursor: string | null
}

// from inclusive and to exclusive, ISO-8601 UTC. A next page repeats the
// filters with the cursor.
export interface SalesQuery {
  creatorId?: string
  from?: string
  to?: string
  cursor?: string
  limit?: number
}

export const MARCA_SALES = "/v1/sales/marca/sales"

type Request = <T>(method: HttpMethod, path: string, body?: unknown) => Promise<T>

export function salesPath(query: SalesQuery) {
  const params = new URLSearchParams()
  for (const [name, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(name, String(value))
  }
  const search = params.toString()
  return search ? `${MARCA_SALES}?${search}` : MARCA_SALES
}

export async function listSales(request: Request, query: SalesQuery): Promise<BrandSalePage> {
  const page = await request<BrandSalePage>("GET", salesPath(query))
  return { items: page?.items ?? [], nextCursor: page?.nextCursor ?? null }
}
