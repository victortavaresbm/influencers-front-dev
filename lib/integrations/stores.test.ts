import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { normalizeShopifyDomain, parseConnectReturn, safeAuthorizeUrl, storeCards, type ConnectionView } from "./stores"

const ID = "0193a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b"

function conn(partial: Partial<ConnectionView>): ConnectionView {
  return {
    id: ID,
    platform: "nuvemshop",
    storeIdentifier: "loja",
    state: "active",
    createdAt: "2026-11-01T00:00:00Z",
    lastEventAt: null,
    ...partial,
  }
}

describe("storeCards", () => {
  it("usa a conexão ativa mais recente de cada plataforma", () => {
    const cards = storeCards([
      conn({ id: "a", state: "disconnected", storeIdentifier: "antiga", createdAt: "2026-11-02T00:00:00Z" }),
      conn({ id: "b", state: "active", storeIdentifier: "loja-x", createdAt: "2026-11-01T00:00:00Z" }),
    ])
    assert.equal(cards.nuvemshop.state, "active")
    assert.equal(cards.nuvemshop.storeLabel, "loja-x")
    assert.equal(cards.nuvemshop.connectionId, "b")
    assert.equal(cards.nuvemshop.canConnect, false)
  })

  it("plataforma sem conexão fica not_connected", () => {
    const cards = storeCards([conn({})])
    assert.equal(cards.shopify.state, "not_connected")
    assert.equal(cards.shopify.canConnect, true)
    assert.equal(cards.shopify.connectionId, null)
  })

  it("só desconectada conta como not_connected", () => {
    assert.equal(storeCards([conn({ state: "disconnected" })]).nuvemshop.state, "not_connected")
  })

  it("credential_error pede reconectar", () => {
    const card = storeCards([conn({ platform: "shopify", state: "credential_error" })]).shopify
    assert.equal(card.state, "credential_error")
    assert.equal(card.canConnect, true)
  })

  it("ignora plataformas que a aba não mostra", () => {
    const cards = storeCards([conn({ platform: "hotmart" })])
    assert.deepEqual(Object.keys(cards).sort(), ["nuvemshop", "shopify"])
  })
})

describe("parseConnectReturn", () => {
  it("lê status ok com connectionId", () => {
    assert.deepEqual(parseConnectReturn(`?status=ok&connectionId=${ID}`), { ok: true, connectionId: ID })
  })

  it("lê erro com code", () => {
    assert.deepEqual(parseConnectReturn("?status=error&code=access_denied"), { ok: false, code: "access_denied" })
  })

  it("erro sem code vira unknown", () => {
    assert.deepEqual(parseConnectReturn("?status=error"), { ok: false, code: "unknown" })
  })

  it("ignora query sem status", () => {
    assert.equal(parseConnectReturn("?foo=1"), null)
    assert.equal(parseConnectReturn("?status=talvez"), null)
  })
})

describe("normalizeShopifyDomain", () => {
  it("aceita loja e loja.myshopify.com", () => {
    assert.equal(normalizeShopifyDomain("minhaloja"), "minhaloja.myshopify.com")
    assert.equal(normalizeShopifyDomain("https://MinhaLoja.myshopify.com/"), "minhaloja.myshopify.com")
    assert.equal(normalizeShopifyDomain("  minha-loja-2.myshopify.com "), "minha-loja-2.myshopify.com")
  })

  it("recusa domínio de fora", () => {
    assert.equal(normalizeShopifyDomain("loja.com.br"), null)
    assert.equal(normalizeShopifyDomain("evil.com/x.myshopify.com"), null)
    assert.equal(normalizeShopifyDomain(""), null)
    assert.equal(normalizeShopifyDomain("-loja"), null)
  })
})

describe("safeAuthorizeUrl", () => {
  it("só deixa sair https", () => {
    assert.equal(safeAuthorizeUrl("https://www.nuvemshop.com.br/apps/1/authorize?state=x"), "https://www.nuvemshop.com.br/apps/1/authorize?state=x")
    assert.equal(safeAuthorizeUrl("javascript:alert(1)"), null)
    assert.equal(safeAuthorizeUrl("http://loja.myshopify.com"), null)
    assert.equal(safeAuthorizeUrl(undefined), null)
  })
})
