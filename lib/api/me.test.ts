import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { buildRequest, type ApiContext } from "./client"
import { ME_BRANDS, ME_INVITATIONS, acceptInvitation, acceptInvitationPath, loadMemberships, pickMarca } from "./me"

const A = "0193a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b"
const B = "0193a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5c"
const ctx: ApiContext = { baseUrl: "https://api.example.com", token: "tok", marcaId: A }

function recordingFetch(bodies: Record<string, unknown>) {
  const calls: { url: string; init: RequestInit }[] = []
  const impl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init })
    const path = new URL(url).pathname
    return new Response(JSON.stringify(bodies[path] ?? {}), { status: 200 })
  }) as unknown as typeof fetch
  return { calls, impl }
}

describe("escolha da Marca ativa", () => {
  it("usa a única Marca da lista", () => {
    assert.equal(pickMarca([{ id: A }], null), A)
    assert.equal(pickMarca([{ id: A.toUpperCase() }], B), A)
  })

  it("usa a última Marca usada quando ela ainda está na lista", () => {
    assert.equal(pickMarca([{ id: A }, { id: B }], B.toUpperCase()), B)
  })

  it("descarta a última usada que saiu da lista e pede o seletor", () => {
    assert.equal(pickMarca([{ id: A }, { id: B }], "0193a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5d"), null)
    assert.equal(pickMarca([{ id: A }, { id: B }], "não-é-uuid"), null)
    assert.equal(pickMarca([{ id: A }, { id: B }], null), null)
  })

  it("fica sem Marca ativa com lista vazia", () => {
    assert.equal(pickMarca([], A), null)
  })
})

describe("cliente", () => {
  it("manda X-Marca-Id da Marca escolhida nas classes marca e creator", () => {
    for (const path of ["/v1/sales/marca/connections", "/v1/sales/creator/sales"]) {
      const headers = buildRequest({ ...ctx, marcaId: B }, "GET", path).init.headers as Record<string, string>
      assert.equal(headers["X-Marca-Id"], B, path)
    }
  })

  it("não manda X-Marca-Id em me", async () => {
    const { calls, impl } = recordingFetch({
      [ME_BRANDS]: { brands: [{ id: A }] },
      [ME_INVITATIONS]: { invitations: [] },
    })
    const got = await loadMemberships(ctx, impl)
    await acceptInvitation(ctx, "inv-1", impl)

    assert.deepEqual(got.brands.map((b) => b.id), [A])
    assert.deepEqual(got.invitations, [])
    assert.deepEqual(
      calls.map((c) => [c.init.method, new URL(c.url).pathname]),
      [
        ["GET", ME_BRANDS],
        ["GET", ME_INVITATIONS],
        ["POST", acceptInvitationPath("inv-1")],
      ]
    )
    for (const call of calls) {
      assert.equal((call.init.headers as Record<string, string>)["X-Marca-Id"], undefined, call.url)
    }
  })
})
