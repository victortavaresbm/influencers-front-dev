import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { couponsPath, storeCouponsPath } from "../api/coupons"
import { COUPON_STATES, couponErrorKey, couponStateBadge, formatStoreDiscount, validateCouponCode } from "./coupons"

// Intl separates "R$" from the amount with a no-break space.
const plain = (text: string) => text.replace(/\s/g, " ")

describe("couponStateBadge", () => {
  it("mapeia os estados de sales.coupons", () => {
    const expected = {
      pending: ["coupons.state.pending", "warning"],
      active: ["coupons.state.active", "success"],
      pending_update: ["coupons.state.pending_update", "warning"],
      pending_deactivation: ["coupons.state.pending_deactivation", "muted"],
      deactivated: ["coupons.state.deactivated", "muted"],
      unsupported: ["coupons.state.unsupported", "neutral"],
      failed: ["coupons.state.failed", "danger"],
    }
    assert.deepEqual([...COUPON_STATES].sort(), Object.keys(expected).sort())
    for (const [state, [labelKey, tone]] of Object.entries(expected)) {
      assert.deepEqual(couponStateBadge(state), { labelKey, tone }, state)
    }
  })

  it("estado desconhecido → rótulo neutro, sem quebrar", () => {
    assert.deepEqual(couponStateBadge("archived"), { labelKey: "coupons.state.unknown", tone: "neutral" })
    assert.deepEqual(couponStateBadge(undefined), { labelKey: "coupons.state.unknown", tone: "neutral" })
  })
})

describe("formatStoreDiscount", () => {
  it("percentage 15 → '15%'; fixed 2000 → 'R$ 20,00'; free_shipping → 'Frete grátis'", () => {
    assert.deepEqual(formatStoreDiscount({ type: "percentage", value: 15 }), { text: "15%" })
    assert.deepEqual(formatStoreDiscount({ type: "percentage", value: 12.5 }), { text: "12,5%" })
    const fixed = formatStoreDiscount({ type: "fixed", value: 2000 })
    assert.equal("text" in fixed ? plain(fixed.text) : null, "R$ 20,00")
    assert.deepEqual(formatStoreDiscount({ type: "free_shipping", value: null }), { labelKey: "coupons.store.freeShipping" })
  })

  it("tipo other → '—'", () => {
    assert.deepEqual(formatStoreDiscount({ type: "other", value: null }), { text: "—" })
    assert.deepEqual(formatStoreDiscount({ type: "bogo", value: 3 }), { text: "—" })
    assert.deepEqual(formatStoreDiscount({ type: "percentage", value: null }), { text: "—" })
  })
})

describe("validateCouponCode", () => {
  it("aceita letras e números, normaliza para maiúsculas", () => {
    assert.deepEqual(validateCouponCode("maria10"), { ok: true, code: "MARIA10" })
    assert.deepEqual(validateCouponCode("  Verao25 "), { ok: true, code: "VERAO25" })
    assert.deepEqual(validateCouponCode("A".repeat(25)), { ok: true, code: "A".repeat(25) })
  })

  it("vazio ou com espaço → erro", () => {
    assert.deepEqual(validateCouponCode(""), { ok: false, errorKey: "coupons.code.required" })
    assert.deepEqual(validateCouponCode("   "), { ok: false, errorKey: "coupons.code.required" })
    assert.deepEqual(validateCouponCode("MARIA 10"), { ok: false, errorKey: "coupons.code.invalid" })
    assert.deepEqual(validateCouponCode("MARIA-10"), { ok: false, errorKey: "coupons.code.invalid" })
    assert.deepEqual(validateCouponCode("ÇÃO10"), { ok: false, errorKey: "coupons.code.invalid" })
    assert.deepEqual(validateCouponCode("A".repeat(26)), { ok: false, errorKey: "coupons.code.invalid" })
  })
})

describe("couponErrorKey", () => {
  it("traduz os erros dos cupons e deixa o resto para o tratamento geral", () => {
    assert.equal(couponErrorKey("coupon_code_taken"), "coupons.error.codeTaken")
    assert.equal(couponErrorKey("store_unavailable"), "coupons.error.storeUnavailable")
    assert.equal(couponErrorKey("module_disabled"), null)
  })
})

describe("caminhos da API", () => {
  it("monta cursor e limite só quando vierem", () => {
    assert.equal(couponsPath(), "/v1/sales/marca/coupons")
    assert.equal(couponsPath("abc=="), "/v1/sales/marca/coupons?cursor=abc%3D%3D")
    assert.equal(
      storeCouponsPath("0193a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5c", "x", 50),
      "/v1/sales/marca/connections/0193a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5c/store-coupons?cursor=x&limit=50"
    )
  })
})
