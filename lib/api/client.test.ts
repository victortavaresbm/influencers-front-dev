import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { ApiError, apiFetch, buildRequest, isMarcaId, parseError, type ApiContext } from "./client"

const MARCA = "0193a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b"
const ctx: ApiContext = { baseUrl: "https://api.example.com/", token: "tok", marcaId: MARCA }

function countingFetch(res: Response) {
  const calls: string[] = []
  const impl = (async (url: string) => {
    calls.push(url)
    return res
  }) as unknown as typeof fetch
  return { calls, impl }
}

function rejects(fn: () => Promise<unknown>, code: string) {
  return assert.rejects(fn, (err: unknown) => err instanceof ApiError && err.code === code)
}

describe("apiRequest", () => {
  it("manda token e Marca", () => {
    const { url, init } = buildRequest(ctx, "GET", "/v1/sales/marca/connections")
    const headers = init.headers as Record<string, string>
    assert.equal(url, "https://api.example.com/v1/sales/marca/connections")
    assert.equal(headers.Authorization, "Bearer tok")
    assert.equal(headers["X-Marca-Id"], MARCA)
  })

  it("não manda X-Marca-Id em rota me/public/admin", () => {
    for (const path of ["/v1/identity/me/x", "/v1/sales/public/x", "/v1/identity/admin/brands"]) {
      const headers = buildRequest(ctx, "GET", path).init.headers as Record<string, string>
      assert.equal(headers["X-Marca-Id"], undefined, path)
    }
  })

  it("recusa rota marca/creator sem Marca ativa, sem chamar a rede", async () => {
    const { calls, impl } = countingFetch(new Response("{}"))
    for (const path of ["/v1/sales/marca/connections", "/v1/sales/creator/sales"]) {
      await rejects(() => apiFetch({ ...ctx, marcaId: null }, "GET", path, undefined, impl), "brand_required")
    }
    assert.equal(calls.length, 0)
  })

  it("recusa chamar sem token", async () => {
    const { calls, impl } = countingFetch(new Response("{}"))
    await rejects(() => apiFetch({ ...ctx, token: null }, "GET", "/v1/sales/marca/connections", undefined, impl), "not_signed_in")
    assert.equal(calls.length, 0)
  })

  it("traduz problem+json", async () => {
    const { impl } = countingFetch(
      new Response(JSON.stringify({ status: 403, code: "module_disabled" }), {
        status: 403,
        headers: { "Content-Type": "application/problem+json" },
      })
    )
    await assert.rejects(
      () => apiFetch(ctx, "GET", "/v1/sales/marca/connections", undefined, impl),
      (err: unknown) => err instanceof ApiError && err.status === 403 && err.code === "module_disabled"
    )
  })

  it("corpo de erro ilegível vira código genérico", async () => {
    const err = await parseError(new Response("<html>bad gateway</html>", { status: 502 }))
    assert.equal(err.status, 502)
    assert.equal(err.code, "http_502")
  })

  it("devolve o JSON e manda o corpo", async () => {
    const { calls, impl } = countingFetch(new Response(JSON.stringify([{ id: "1" }])))
    const data = await apiFetch<{ id: string }[]>(ctx, "POST", "/v1/sales/marca/connections/shopify", { shop: "x" }, impl)
    assert.deepEqual(data, [{ id: "1" }])
    assert.equal(calls.length, 1)
    const { init } = buildRequest(ctx, "POST", "/v1/sales/marca/connections/shopify", { shop: "x" })
    assert.equal(init.body, '{"shop":"x"}')
  })

  it("resposta vazia vira undefined", async () => {
    const { impl } = countingFetch(new Response(null, { status: 202 }))
    assert.equal(await apiFetch(ctx, "POST", "/v1/sales/marca/connections/1/products/sync", undefined, impl), undefined)
  })

  it("sem URL do gateway não chama", () => {
    assert.throws(() => buildRequest({ ...ctx, baseUrl: "" }, "GET", "/v1/x/me/y"), (err: unknown) => err instanceof ApiError && err.code === "api_not_configured")
  })
})

describe("marca ativa", () => {
  it("aceita só UUID", () => {
    assert.equal(isMarcaId("abc"), false)
    assert.equal(isMarcaId(""), false)
    assert.equal(isMarcaId(null), false)
    assert.equal(isMarcaId(MARCA), true)
  })
})
