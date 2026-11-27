// Hotmart has no OAuth: the Marca pastes the credentials and the hottok, gets
// back a secret webhook URL and registers it on Hotmart by hand. These are the
// pure rules of that guide; the answer shape is the sales
// platform/hotmart/dto/HotmartConnectionView.java.
import type { ConnectionState, ConnectionView } from "./stores"

export interface HotmartGuideStep {
  step: number
  code: string
}

export interface HotmartConnectionView {
  connection: ConnectionView
  // Secret: the last segment authenticates the deliveries. Never persisted.
  webhookUrl: string
  guide: HotmartGuideStep[]
}

// The purchase events the sales translator reads; the Marca ticks at least these.
export const HOTMART_EVENTS = ["PURCHASE_APPROVED", "PURCHASE_REFUNDED", "PURCHASE_CHARGEBACK", "PURCHASE_CANCELED"] as const

export interface HotmartCredentials {
  clientId: string
  clientSecret: string
}

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/
const PRINTABLE = /^[\x21-\x7e]+$/

// Hotmart shows "Basic base64(client_id:client_secret)" next to the two values;
// pasting it fills both. Splits on the first ":" — the secret may contain one.
export function parseBasic(input: string): HotmartCredentials | null {
  const encoded = input.trim().replace(/^basic\s+/i, "").trim()
  if (!BASE64.test(encoded)) return null
  let decoded: string
  try {
    decoded = new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0)))
  } catch {
    return null
  }
  const colon = decoded.indexOf(":")
  if (colon <= 0) return null
  const clientId = decoded.slice(0, colon)
  const clientSecret = decoded.slice(colon + 1)
  if (!PRINTABLE.test(clientId) || !PRINTABLE.test(clientSecret)) return null
  return { clientId, clientSecret }
}

export interface HotmartForm {
  clientId: string
  clientSecret: string
  hottok: string
}

export type HotmartFieldError = "required" | "too_long"

// Same limits as sales HotmartCredentialsForm: @NotBlank @Size(max = 200).
const MAX_FIELD = 200

export function validateHotmartForm(form: HotmartForm): {
  values: HotmartForm
  errors: Partial<Record<keyof HotmartForm, HotmartFieldError>>
} {
  const values: HotmartForm = {
    clientId: form.clientId.trim(),
    clientSecret: form.clientSecret.trim(),
    hottok: form.hottok.trim(),
  }
  const errors: Partial<Record<keyof HotmartForm, HotmartFieldError>> = {}
  for (const field of Object.keys(values) as (keyof HotmartForm)[]) {
    if (!values[field]) errors[field] = "required"
    else if (values[field].length > MAX_FIELD) errors[field] = "too_long"
  }
  return { values, errors }
}

const KNOWN_STEPS = ["open_hotmart_webhook_settings", "register_webhook_url", "select_purchase_events"] as const

export type HotmartGuideKey = `hotmart.guide.${(typeof KNOWN_STEPS)[number]}` | "hotmart.guide.unknown"

// The sales answers the steps by code; a code this front does not know yet
// shows a generic step instead of breaking the guide.
export function guideSteps(guide: HotmartGuideStep[] | null | undefined): (HotmartGuideStep & { key: HotmartGuideKey })[] {
  return [...(guide ?? [])]
    .sort((a, b) => a.step - b.step)
    .map((s) => ({
      step: s.step,
      code: s.code,
      key: (KNOWN_STEPS as readonly string[]).includes(s.code) ? (`hotmart.guide.${s.code}` as HotmartGuideKey) : "hotmart.guide.unknown",
    }))
}

export const ACTIVATION_POLL_MS = 5_000
export const ACTIVATION_LIMIT_MS = 10 * 60_000

export type ActivationCheck = { waitMs: number } | { done: "connected" | "timeout" | "failed" }

// The connection turns active on the first webhook with a valid hottok — the
// "Enviar teste" on Hotmart. One check every 5 s, for up to 10 min.
export function nextActivationCheck(state: ConnectionState, elapsedMs: number): ActivationCheck {
  if (state === "active") return { done: "connected" }
  if (state !== "pending") return { done: "failed" }
  return elapsedMs >= ACTIVATION_LIMIT_MS ? { done: "timeout" } : { waitMs: ACTIVATION_POLL_MS }
}

// Where each step sends the Marca. Hotmart has no documented deep links into
// Ferramentas; the help articles are the official ones.
export const HOTMART_LINKS = {
  tools: "https://app.hotmart.com/tools",
  credentialsHelp:
    "https://help.hotmart.com/pt-br/article/4403617024013/como-utilizo-as-apis-da-hotmart-e-o-hotmart-developers-para-integrar-meu-negocio-",
  webhookHelp: "https://help.hotmart.com/pt-br/article/como-configurar-sua-api-atraves-do-webhook-postback-/360001491352",
} as const

// Step 1 is done once both credentials are there (typed or filled by the Basic).
export function credentialsFilled(form: Pick<HotmartForm, "clientId" | "clientSecret">) {
  return form.clientId.trim() !== "" && form.clientSecret.trim() !== ""
}
