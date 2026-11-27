"use client"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { ArrowRight, Check, Copy, ExternalLink as ExternalLinkIcon, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { apiErrorCode, apiErrorMessage } from "@/lib/api/errors"
import { useApi } from "@/lib/api/use-api"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import {
  HOTMART_EVENTS,
  HOTMART_LINKS,
  credentialsFilled,
  nextActivationCheck,
  parseBasic,
  validateHotmartForm,
  type HotmartConnectionView,
  type HotmartFieldError,
  type HotmartForm,
} from "@/lib/integrations/hotmart"
import type { ConnectionState, ConnectionView } from "@/lib/integrations/stores"

const CONNECTIONS = "/v1/sales/marca/connections"

// The Hotmart guide in 4 steps: credentials, hottok (connects), webhook and
// test. Nothing typed is persisted: it is gone when the dialog closes.
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("hotmart.title")}</DialogTitle>
          {resuming && <DialogDescription>{t("hotmart.resumeHelp")}</DialogDescription>}
        </DialogHeader>
        {open && <HotmartGuide onConnected={onConnected} />}
      </DialogContent>
    </Dialog>
  )
}

type Phase = 1 | 2 | 3 | 4
type Outcome = "waiting" | "timeout" | "failed"

const EMPTY: HotmartForm = { clientId: "", clientSecret: "", hottok: "" }

const STEPS = ["hotmart.step1", "hotmart.step2", "hotmart.step3", "hotmart.step4"] as const

function HotmartGuide({ onConnected }: { onConnected: () => void }) {
  const { t } = useI18n()
  const { request } = useApi()
  const [phase, setPhase] = useState<Phase>(1)
  const [form, setForm] = useState<HotmartForm>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<keyof HotmartForm, HotmartFieldError>>>({})
  const [basic, setBasic] = useState<"idle" | "filled" | "invalid">("idle")
  const [manual, setManual] = useState(false)
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

  useEffect(() => {
    if (phase !== 4 || !connectionId) return
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
    if (found.clientId || found.clientSecret) return setPhase(1)
    if (found.hottok) return
    setBusy(true)
    try {
      const answer = await request<HotmartConnectionView>("POST", `${CONNECTIONS}/hotmart`, values)
      setView(answer)
      setForm(EMPTY)
      setPhase(3)
    } catch (err) {
      const credentialsRejected = apiErrorCode(err) === "hotmart_credentials_rejected"
      setRejected(credentialsRejected)
      setSubmitError(apiErrorMessage(t, err))
      if (credentialsRejected) setPhase(1)
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

  let body: ReactNode
  let footer: ReactNode
  if (phase === 1) {
    body = (
      <>
        <Instructions
          items={[
            <ExternalLink key="link" href={HOTMART_LINKS.credentials}>
              {t("hotmart.s1.link")}
            </ExternalLink>,
            t("hotmart.s1.create"),
            t("hotmart.s1.copy"),
          ]}
          help={HOTMART_LINKS.credentialsHelp}
        />
        <Field label={t("hotmart.basic")}>
          <Input
            autoFocus
            type="password"
            autoComplete="off"
            aria-label={t("hotmart.basic")}
            aria-invalid={basic === "invalid" || rejected}
            placeholder="Basic …"
            onChange={(event) => pasteBasic(event.target.value)}
          />
          {basic === "invalid" && <p className="text-xs text-red-600">{t("hotmart.basicInvalid")}</p>}
          {basic === "filled" && (
            <p className="flex items-center gap-1 text-xs text-emerald-700">
              <Check className="size-3.5" />
              {t("hotmart.basicFilled")}
            </p>
          )}
        </Field>
        {rejected && submitError && <p className="text-sm text-red-600">{submitError}</p>}
        <button type="button" className="cursor-pointer text-xs text-zinc-500 underline underline-offset-2" onClick={() => setManual((m) => !m)}>
          {t(manual ? "hotmart.manualHide" : "hotmart.manualShow")}
        </button>
        {manual && (
          <div className="space-y-3">
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
          </div>
        )}
      </>
    )
    footer = (
      <Button type="button" disabled={!credentialsFilled(form)} onClick={() => setPhase(2)}>
        {t("hotmart.next")}
        <ArrowRight data-icon="inline-end" />
      </Button>
    )
  } else if (phase === 2) {
    body = (
      <>
        <Instructions
          items={[
            <ExternalLink key="link" href={HOTMART_LINKS.hottok}>
              {t("hotmart.s2.link")}
            </ExternalLink>,
            t("hotmart.s2.copy"),
          ]}
          help={HOTMART_LINKS.webhookHelp}
        />
        <Field label={t("hotmart.hottok")} error={fieldError("hottok")}>
          <SecretInput
            label={t("hotmart.hottok")}
            invalid={Boolean(errors.hottok)}
            value={form.hottok}
            onChange={(value) => setField("hottok", value)}
          />
        </Field>
        {submitError && !rejected && <p className="text-sm text-red-600">{submitError}</p>}
        <p className="text-xs text-zinc-500">{t("hotmart.s2.validates")}</p>
      </>
    )
    footer = (
      <>
        <Button type="button" variant="outline" onClick={() => setPhase(1)}>
          {t("hotmart.back")}
        </Button>
        <Button type="button" disabled={busy || !form.hottok.trim()} onClick={() => void submit()}>
          {busy && <Loader2 className="animate-spin" />}
          {t("hotmart.connect")}
        </Button>
      </>
    )
  } else if (phase === 3 && view) {
    body = (
      <>
        <Instructions
          items={[
            <ExternalLink key="link" href={HOTMART_LINKS.webhook}>
              {t("hotmart.s3.link")}
            </ExternalLink>,
            t("hotmart.s3.register"),
            t("hotmart.s3.fill"),
          ]}
          help={HOTMART_LINKS.webhookHelp}
        />
        <dl className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 text-sm">
          <FormRow label={t("hotmart.form.name")}>{t("hotmart.form.nameValue")}</FormRow>
          <FormRow label={t("hotmart.form.url")}>
            <div className="flex items-start gap-2">
              <code className="min-w-0 flex-1 rounded-md bg-zinc-100 px-2 py-1.5 font-mono text-xs break-all text-zinc-800">{view.webhookUrl}</code>
              <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => void copy(view.webhookUrl)}>
                <Copy />
                {t("hotmart.copyUrl")}
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-amber-700">{t("hotmart.webhookSecret")}</p>
          </FormRow>
          <FormRow label={t("hotmart.form.version")}>{t("hotmart.form.versionValue")}</FormRow>
          <FormRow label={t("hotmart.form.product")}>{t("hotmart.form.productValue")}</FormRow>
          <FormRow label={t("hotmart.form.events")}>
            <ul className="space-y-1">
              {HOTMART_EVENTS.map((event) => (
                <li key={event} className="flex items-center gap-2">
                  <Check className="size-3.5 shrink-0 text-emerald-600" />
                  <span>{t(`hotmart.event.${event}`)}</span>
                  <span className="font-mono text-[11px] text-zinc-400">{event}</span>
                </li>
              ))}
            </ul>
          </FormRow>
        </dl>
        <p className="text-sm text-zinc-700">{t("hotmart.s3.save")}</p>
      </>
    )
    footer = (
      <Button
        type="button"
        onClick={() => {
          setOutcome("waiting")
          setPhase(4)
        }}
      >
        {t("hotmart.s3.done")}
        <ArrowRight data-icon="inline-end" />
      </Button>
    )
  } else {
    body = (
      <>
        <Instructions items={[t("hotmart.s4.test")]} />
        <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          {outcome === "waiting" && (
            <>
              <Loader2 className="size-5 shrink-0 animate-spin text-zinc-500" />
              <p className="text-sm text-zinc-700">{t("hotmart.waiting")}</p>
            </>
          )}
          {outcome === "timeout" && <p className="text-sm text-amber-700">{t("hotmart.timeout")}</p>}
          {outcome === "failed" && <p className="text-sm text-red-600">{t("hotmart.failed")}</p>}
        </div>
      </>
    )
    footer = (
      <>
        <Button type="button" variant="outline" onClick={() => setPhase(outcome === "failed" ? 1 : 3)}>
          {t("hotmart.back")}
        </Button>
        {outcome === "timeout" && (
          <Button
            type="button"
            onClick={() => {
              setOutcome("waiting")
              setAttempt((n) => n + 1)
            }}
          >
            {t("hotmart.retry")}
          </Button>
        )}
      </>
    )
  }

  return (
    <div className="min-w-0 space-y-5">
      <Stepper current={phase} />
      <div className="min-w-0 space-y-4">
        <h3 className="text-base font-semibold text-zinc-900">{t(STEPS[phase - 1])}</h3>
        {body}
      </div>
      <DialogFooter>{footer}</DialogFooter>
    </div>
  )
}

function Stepper({ current }: { current: Phase }) {
  const { t } = useI18n()
  return (
    <ol className="flex items-start" aria-label={t("hotmart.stepOf", { n: current })}>
      {STEPS.map((key, index) => {
        const n = index + 1
        const done = n < current
        const active = n === current
        return (
          <li key={key} className="flex flex-1 flex-col items-center gap-1.5 text-center" aria-current={active ? "step" : undefined}>
            <div className="flex w-full items-center">
              <span className={cn("h-px flex-1", index === 0 ? "bg-transparent" : done || active ? "bg-zinc-900" : "bg-zinc-200")} />
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  done && "bg-zinc-900 text-white",
                  active && "bg-zinc-900 text-white ring-4 ring-zinc-200",
                  !done && !active && "border border-zinc-300 text-zinc-500"
                )}
              >
                {done ? <Check className="size-3.5" /> : n}
              </span>
              <span className={cn("h-px flex-1", index === STEPS.length - 1 ? "bg-transparent" : done ? "bg-zinc-900" : "bg-zinc-200")} />
            </div>
            <span className={cn("text-[11px] leading-tight", active ? "font-medium text-zinc-900" : "text-zinc-500")}>{t(key)}</span>
          </li>
        )
      })}
    </ol>
  )
}

function Instructions({ items, help }: { items: ReactNode[]; help?: string }) {
  const { t } = useI18n()
  return (
    <div className="space-y-2">
      <ol className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex gap-2.5 text-sm text-zinc-700">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-semibold text-zinc-600">
              {index + 1}
            </span>
            <span className="min-w-0 pt-px">{item}</span>
          </li>
        ))}
      </ol>
      {help && (
        <ExternalLink href={help} className="text-xs text-zinc-500">
          {t("hotmart.howTo")}
        </ExternalLink>
      )}
    </div>
  )
}

function ExternalLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex items-center gap-1 font-medium text-zinc-900 underline underline-offset-2", className)}
    >
      {children}
      <ExternalLinkIcon className="size-3" />
    </a>
  )
}

function FormRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 px-3 py-2.5 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3">
      <dt className="text-xs font-medium text-zinc-500 sm:pt-0.5">{label}</dt>
      <dd className="min-w-0 text-zinc-800">{children}</dd>
    </div>
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

