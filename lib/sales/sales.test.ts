import { describe, it } from "node:test"
import assert from "node:assert/strict"
import type { BrandSaleView } from "../api/sales"
import { buildSalesQuery, formatCents, saleStatusBadge, summarize, SALE_STATUSES } from "./sales"

// Intl separates "R$" from the amount with a no-break space.
const plain = (text: string) => text.replace(/\s/g, " ")

function sale(partial: Partial<BrandSaleView>): BrandSaleView {
  return {
    orderId: "0193a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b",
    saleId: null,
    attributed: false,
    creatorId: null,
    connectionId: "0193a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5c",
    platform: "shopify",
    coupon: null,
    status: "unattributed",
    orderState: "PAID",
    paidAt: "2026-11-20T14:30:00Z",
    grossAmountCents: 0,
    discountAmountCents: 0,
    refundedAmountCents: 0,
    consolidatedAmountCents: null,
    consolidatedAt: null,
    refundedSaleCents: 0,
    ...partial,
  }
}

describe("formatCents", () => {
  it("centavos em BRL", () => {
    assert.equal(plain(formatCents(14990)), "R$ 149,90")
  })
})

describe("saleStatusBadge", () => {
  it("mapeia cada status para rótulo e cor", () => {
    const expected = {
      pending: ["sales.status.pending", "warning"],
      consolidated: ["sales.status.consolidated", "success"],
      not_consolidated: ["sales.status.not_consolidated", "muted"],
      partially_refunded: ["sales.status.partially_refunded", "warning"],
      refunded: ["sales.status.refunded", "danger"],
      unattributed: ["sales.status.unattributed", "neutral"],
    }
    assert.deepEqual([...SALE_STATUSES].sort(), Object.keys(expected).sort())
    for (const [status, [labelKey, tone]] of Object.entries(expected)) {
      assert.deepEqual(saleStatusBadge(status), { labelKey, tone }, status)
    }
  })

  it("status desconhecido → rótulo neutro, sem quebrar", () => {
    assert.deepEqual(saleStatusBadge("chargeback_pending"), { labelKey: "sales.status.unknown", tone: "neutral" })
    assert.deepEqual(saleStatusBadge(undefined), { labelKey: "sales.status.unknown", tone: "neutral" })
  })
})

describe("buildSalesQuery", () => {
  const today = new Date(2026, 10, 27, 15, 0)

  it("monta from/to em UTC a partir do período local", () => {
    const query = buildSalesQuery({ preset: "30", from: "", to: "" }, { today })
    // 30 days ending today, local midnights; to is exclusive (the next day).
    assert.equal(query.from, new Date(2026, 9, 29).toISOString())
    assert.equal(query.to, new Date(2026, 10, 28).toISOString())
    assert.match(query.from ?? "", /Z$/)
    assert.equal(query.cursor, undefined)

    const custom = buildSalesQuery({ preset: "custom", from: "2026-11-01", to: "" }, { today })
    assert.equal(custom.from, new Date(2026, 10, 1).toISOString())
    assert.equal(custom.to, undefined)

    assert.deepEqual(buildSalesQuery({ preset: "all", from: "", to: "" }, { today }), {})
  })

  it("repete os filtros com o cursor da página seguinte", () => {
    const period = { preset: "7" as const, from: "", to: "" }
    const first = buildSalesQuery(period, { today })
    const next = buildSalesQuery(period, { today, cursor: "MjAyNi0xMS0yMA" })
    assert.deepEqual(next, { ...first, cursor: "MjAyNi0xMS0yMA" })
  })
})

describe("summarize", () => {
  it("soma pedidos e valor bruto das páginas carregadas", () => {
    const pages = [[sale({ grossAmountCents: 14990 }), sale({ grossAmountCents: 5010 })], [sale({ grossAmountCents: 1000 })]]
    assert.deepEqual(summarize(pages.flat()), { orders: 3, grossCents: 21000 })
  })

  it("lista vazia → zeros", () => {
    assert.deepEqual(summarize([]), { orders: 0, grossCents: 0 })
  })
})
