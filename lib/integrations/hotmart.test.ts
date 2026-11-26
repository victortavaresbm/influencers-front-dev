import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { guideSteps, nextActivationCheck, parseBasic, validateHotmartForm } from "./hotmart"

const b64 = (text: string) => Buffer.from(text, "utf8").toString("base64")

describe("parseBasic", () => {
  it("extrai client id e secret do Basic", () => {
    assert.deepEqual(parseBasic("Basic " + b64("abc-123:s3cr:et")), { clientId: "abc-123", clientSecret: "s3cr:et" })
  })

  it("aceita sem o prefixo Basic e com espaços", () => {
    assert.deepEqual(parseBasic("  " + b64("id:sec") + "\n"), { clientId: "id", clientSecret: "sec" })
    assert.deepEqual(parseBasic("basic   " + b64("id:sec")), { clientId: "id", clientSecret: "sec" })
  })

  it("não é Basic → null", () => {
    assert.equal(parseBasic("abc"), null)
    assert.equal(parseBasic(b64("semdoispontos")), null)
    assert.equal(parseBasic(b64(":sec")), null)
    assert.equal(parseBasic(b64("id:")), null)
    assert.equal(parseBasic(""), null)
    assert.equal(parseBasic("Basic não-é-base64!"), null)
  })
})

describe("validateHotmartForm", () => {
  it("exige os três campos, sem espaços nas pontas", () => {
    const result = validateHotmartForm({ clientId: " a ", clientSecret: "", hottok: "h" })
    assert.deepEqual(result.errors, { clientSecret: "required" })
    assert.deepEqual(result.values, { clientId: "a", clientSecret: "", hottok: "h" })
  })

  it("só espaços conta como vazio", () => {
    assert.deepEqual(validateHotmartForm({ clientId: "a", clientSecret: "b", hottok: "   " }).errors, { hottok: "required" })
  })

  it("recusa campo com mais de 200 caracteres", () => {
    const result = validateHotmartForm({ clientId: "a", clientSecret: "b", hottok: "x".repeat(201) })
    assert.deepEqual(result.errors, { hottok: "too_long" })
    assert.deepEqual(validateHotmartForm({ clientId: "a", clientSecret: "b", hottok: "x".repeat(200) }).errors, {})
  })
})

describe("guideSteps", () => {
  it("ordena pelo step e traduz cada code", () => {
    const steps = guideSteps([
      { step: 2, code: "register_webhook_url" },
      { step: 1, code: "open_hotmart_webhook_settings" },
    ])
    assert.deepEqual(
      steps.map((s) => s.step),
      [1, 2]
    )
    assert.deepEqual(
      steps.map((s) => s.key),
      ["hotmart.guide.open_hotmart_webhook_settings", "hotmart.guide.register_webhook_url"]
    )
  })

  it("code desconhecido vira passo genérico, sem quebrar", () => {
    assert.deepEqual(guideSteps([{ step: 4, code: "novo_passo" }]), [{ step: 4, code: "novo_passo", key: "hotmart.guide.unknown" }])
  })

  it("guia ausente vira lista vazia", () => {
    assert.deepEqual(guideSteps(undefined), [])
  })
})

describe("nextActivationCheck", () => {
  it("active encerra com sucesso", () => {
    assert.deepEqual(nextActivationCheck("active", 30_000), { done: "connected" })
  })

  it("pending espera 5 s até 10 min", () => {
    assert.deepEqual(nextActivationCheck("pending", 0), { waitMs: 5000 })
    assert.deepEqual(nextActivationCheck("pending", 599_999), { waitMs: 5000 })
    assert.deepEqual(nextActivationCheck("pending", 600_000), { done: "timeout" })
  })

  it("credential_error ou disconnected encerra com erro", () => {
    assert.deepEqual(nextActivationCheck("credential_error", 1000), { done: "failed" })
    assert.deepEqual(nextActivationCheck("disconnected", 1000), { done: "failed" })
  })
})
