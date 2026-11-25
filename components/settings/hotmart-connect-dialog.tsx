"use client"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { Copy, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { apiErrorCode, apiErrorMessage } from "@/lib/api/errors"
import { useApi } from "@/lib/api/use-api"
import { useI18n } from "@/lib/i18n"
import {
  HOTMART_EVENTS,
  guideSteps,
  nextActivationCheck,
  parseBasic,
  validateHotmartForm,
  type HotmartConnectionView,
  type HotmartFieldError,
  type HotmartForm,
} from "@/lib/integrations/hotmart"
import type { ConnectionState, ConnectionView } from "@/lib/integrations/stores"

const CONNECTIONS = "/v1/sales/marca/connections"

// The Hotmart guide: credentials and hottok (steps 1–2, one form), the webhook
// URL to register (3) and the wait for Hotmart's test delivery (4). Nothing
// typed here is persisted: it lives in this component and is gone on close.
export function HotmartConnectDialog({
  open,
  resuming,
  onOpenChange,
  onConnected,
}: {
  open: boolean
  resuming: boolean
  onOpenChange: (open: boolean) => void
  onConnected: () => void
}) {
  const { t } = useI18n()
  return (
    <Dialog open={open} onOpenChange={(next) => onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("hotmart.title")}</DialogTitle>
          {resuming && <DialogDescription>{t("hotmart.resumeHelp")}</DialogDescription>}
        </DialogHeader>
        {open && <HotmartGuide onConnected={onConnected} />}
      </DialogContent>
    </Dialog>
  )
}

type Phase = "credentials" | "webhook" | "confirm"
type Outcome = "waiting" | "timeout" | "failed"

const EMPTY: HotmartForm = { clientId: "", clientSecret: "", hottok: "" }

function HotmartGuide({ onConnected }: { onConnected: () => void }) {
  const { t } = useI18n()
  const { request } = useApi()
  const [phase, setPhase] = useState<Phase>("credentials")
  const [form, setForm] = useState<HotmartForm>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof HotmartForm, HotmartFieldError>>>({})
  const [basic, setBasic] = useState<"idle" | "filled" | "invalid">("idle")
  const [rejected, setRejected] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [view, setView] = useState<HotmartConnectionView | null>(null)
  const [outcome, setOutcome] = useState<Outcome>("waiting")
  const [attempt, setAttempt] = useState(0)

  const connectionId = view?.connection.id ?? null
  // The parent's callback changes identity on renders; it must not restart the wait.
  const connected = useRef(onConnected)
  useEffect(() => {
    connected.current = onConnected
  }, [onConnected])

  // Step 4: one check at a time, chained, bounded by nextActivationCheck.
  // Closing the guide unmounts this component and stops the chain.
  useEffect(() => {
    if (phase !== "confirm" || !connectionId) return
    let stopped = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const started = Date.now()
    const check = async () => {
      let state: ConnectionState = "pending"
      try {
        state = (await request<ConnectionView>("GET", `${CONNECTIONS}/${connectionId}`)).state
      } catch {
        // A failed check is not an answer; keep waiting until the limit.
      }
      if (stopped) return
      const next = nextActivationCheck(state, Date.now() - started)
      if ("waitMs" in next) timer = setTimeout(check, next.waitMs)
      else if (next.done === "connected") connected.current()
      else setOutcome(next.done)
    }
    void check()
    return () => {
      stopped = true
      clearTimeout(timer)
    }
  }, [phase, connectionId, attempt, request])

  const setField = (field: keyof HotmartForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    if (field !== "hottok") setRejected(false)
  }

  const pasteBasic = (value: string) => {
    if (!value.trim()) return setBasic("idle")
    const parsed = parseBasic(value)
    if (!parsed) return setBasic("invalid")
    // Only the two values go on; the Basic itself is never kept or sent.
    setForm((current) => ({ ...current, ...parsed }))
    setErrors((current) => ({ ...current, clientId: undefined, clientSecret: undefined }))
    setRejected(false)
    setBasic("filled")
  }

  const submit = async () => {
    const { values, errors: found } = validateHotmartForm(form)
    setForm(values)
    setErrors(found)
    setSubmitError(null)
    if (Object.keys(found).length > 0) return
    setBusy(true)
    try {
      const answer = await request<HotmartConnectionView>("POST", `${CONNECTIONS}/hotmart`, values)
      setView(answer)
      setForm(EMPTY)
      setPhase("webhook")
    } catch (err) {
      setRejected(apiErrorCode(err) === "hotmart_credentials_rejected")
      setSubmitError(apiErrorMessage(t, err))
    } finally {
      setBusy(false)
    }
  }

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      return
    }
    toast.add({ type: "success", title: t("hotmart.copied") })
  }

  const fieldError = (field: keyof HotmartForm) =>
    errors[field] ? t(errors[field] === "too_long" ? "hotmart.fieldTooLong" : "hotmart.fieldRequired") : null

  if (phase === "credentials") {
    return (
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <Step n={1} title={t("hotmart.credentialsTitle")} help={t("hotmart.credentialsHelp")}>
          <Field label={t("hotmart.basic")}>
            <Input
              type="password"
              autoComplete="off"
              aria-label={t("hotmart.basic")}
              aria-invalid={basic === "invalid"}
              placeholder="Basic …"
              onChange={(event) => pasteBasic(event.target.value)}
            />
            {basic === "invalid" && <p className="text-xs text-red-600">{t("hotmart.basicInvalid")}</p>}
            {basic === "filled" && <p className="text-xs text-emerald-700">{t("hotmart.basicFilled")}</p>}
          </Field>
          <Field label={t("hotmart.clientId")} error={fieldError("clientId")}>
            <Input
              autoComplete="off"
              aria-label={t("hotmart.clientId")}
              aria-invalid={Boolean(errors.clientId) || rejected}
              value={form.clientId}
              onChange={(event) => setField("clientId", event.target.value)}
            />
          </Field>
          <Field label={t("hotmart.clientSecret")} error={fieldError("clientSecret")}>
            <SecretInput
              label={t("hotmart.clientSecret")}
              invalid={Boolean(errors.clientSecret) || rejected}
              value={form.clientSecret}
              onChange={(value) => setField("clientSecret", value)}
            />
          </Field>
        </Step>
        <Step n={2} title={t("hotmart.hottokTitle")} help={t("hotmart.hottokHelp")}>
          <Field label={t("hotmart.hottok")} error={fieldError("hottok")}>
            <SecretInput
              label={t("hotmart.hottok")}
              invalid={Boolean(errors.hottok)}
              value={form.hottok}
              onChange={(value) => setField("hottok", value)}
            />
          </Field>
        </Step>
        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
        <DialogFooter>
          <Button type="submit" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            {t("hotmart.connect")}
          </Button>
        </DialogFooter>
      </form>
    )
  }

  if (phase === "webhook" && view) {
    return (
      <div className="space-y-5">
        <Step n={3} title={t("hotmart.webhookTitle")}>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-600">
            {guideSteps(view.guide).map((step) => (
              <li key={`${step.step}-${step.code}`}>{t(step.key)}</li>
            ))}
          </ol>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md bg-zinc-100 px-2 py-1.5 font-mono text-xs text-zinc-800">
              {view.webhookUrl}
            </code>
            <Button type="button" variant="outline" size="sm" onClick={() => void copy(view.webhookUrl)}>
              <Copy />
              {t("hotmart.copyUrl")}
            </Button>
          </div>
          <p className="text-xs text-amber-700">{t("hotmart.webhookSecret")}</p>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-zinc-700">{t("hotmart.events")}</p>
            <div className="flex flex-wrap gap-1.5">
              {HOTMART_EVENTS.map((event) => (
                <Button
                  key={event}
                  type="button"
                  variant="outline"
                  size="xs"
                  aria-label={t("hotmart.copy", { value: event })}
                  onClick={() => void copy(event)}
                >
                  <span className="font-mono">{event}</span>
                  <Copy data-icon="inline-end" />
                </Button>
              ))}
            </div>
          </div>
        </Step>
        <DialogFooter>
          <Button type="button" onClick={() => {
              setOutcome("waiting")
              setPhase("confirm")
            }}>
            {t("hotmart.next")}
          </Button>
        </DialogFooter>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Step n={4} title={t("hotmart.confirmTitle")}>
        {outcome === "waiting" && (
          <p className="flex items-center gap-2 text-sm text-zinc-600">
            <Loader2 className="size-4 shrink-0 animate-spin" />
            {t("hotmart.waiting")}
          </p>
        )}
        {outcome === "timeout" && <p className="text-sm text-amber-700">{t("hotmart.timeout")}</p>}
        {outcome === "failed" && <p className="text-sm text-red-600">{t("hotmart.failed")}</p>}
      </Step>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => setPhase(outcome === "failed" ? "credentials" : "webhook")}>
          {t("hotmart.back")}
        </Button>
        {outcome === "timeout" && (
          <Button type="button" onClick={() => {
              setOutcome("waiting")
              setAttempt((n) => n + 1)
            }}>
            {t("hotmart.retry")}
          </Button>
        )}
      </DialogFooter>
    </div>
  )
}

function Step({ n, title, help, children }: { n: number; title: string; help?: string; children: ReactNode }) {
  const { t } = useI18n()
  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">{t("hotmart.stepOf", { n })}</p>
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
        {help && <p className="mt-1 text-sm text-zinc-600">{help}</p>}
      </div>
      {children}
    </section>
  )
}

function Field({ label, error, children }: { label: string; error?: string | null; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-zinc-700">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-600">{error}</span>}
    </label>
  )
}

function SecretInput({
  label,
  invalid,
  value,
  onChange,
}: {
  label: string
  invalid: boolean
  value: string
  onChange: (value: string) => void
}) {
  const { t } = useI18n()
  const [shown, setShown] = useState(false)
  return (
    <div className="flex gap-2">
      <Input
        type={shown ? "text" : "password"}
        autoComplete="off"
        aria-label={label}
        aria-invalid={invalid}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={t(shown ? "hotmart.hide" : "hotmart.show")}
        onClick={() => setShown((s) => !s)}
      >
        {shown ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  )
}

