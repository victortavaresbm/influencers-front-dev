"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { SiteCanvas } from "@/components/forms/site-canvas"
import { FormRunner } from "@/components/forms/form-runner"
import { scoreApplication } from "@/lib/forms/brief-check"
import { branchTarget, pageHasForm, type FormSite, type SiteAction, type SiteBlock, type SitePage } from "@/lib/mock-data/form-site"
import {
  answerAccepted,
  type AnswerValue,
  type ApplicationForm,
  type FormAnswer,
  type ResponseTracking,
  type StepEvent,
} from "@/lib/mock-data/forms"
import { Button } from "@/components/ui/button"
import { useFormStore } from "@/lib/stores/forms"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export interface FunnelRespondent {
  sessionId?: string
  creatorId?: string
  creatorName?: string
  creatorHandle?: string
}

function writeAnswer(answers: FormAnswer[], questionId: string, value: AnswerValue): FormAnswer[] {
  return [...answers.filter((answer) => answer.questionId !== questionId), { questionId, value }]
}

function leadEmailOf(form: ApplicationForm, answers: FormAnswer[]) {
  const question = form.questions.find((item) => item.type === "email")
  if (!question) return undefined
  const value = answers.find((answer) => answer.questionId === question.id)?.value
  return typeof value === "string" && value.includes("@") ? value.trim() : undefined
}

function missingRequired(form: ApplicationForm, page: SitePage, answers: FormAnswer[]) {
  return page.blocks.flatMap((block) => {
    if (block.type !== "field") return []
    const question = form.questions.find((item) => item.id === block.questionId)
    if (!question?.required) return []
    const value = answers.find((answer) => answer.questionId === question.id)?.value
    return answerAccepted(question, value) ? [] : [question.id]
  })
}

function pageProgress(site: FormSite, page: SitePage) {
  if (page.final) return 1
  const steps = site.pages.filter((item) => !item.final)
  const index = steps.findIndex((item) => item.id === page.id)
  if (index < 0 || steps.length === 0) return 0
  return (index + 1) / (steps.length + 1)
}

function readTracking(): ResponseTracking {
  const params = new URLSearchParams(window.location.search)
  const utmSource = params.get("utm_source") || undefined
  const width = window.innerWidth
  return {
    channel: utmSource || (document.referrer ? "referral" : "direct"),
    destination: `${window.location.pathname}${window.location.search}`,
    fbclid: params.get("fbclid") || undefined,
    utmSource,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    utmContent: params.get("utm_content") || undefined,
    utmTerm: params.get("utm_term") || undefined,
    device: width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop",
  }
}

export function SitePlayer({
  form,
  applicationForm,
  preview = false,
  persist = false,
  respondent,
  device = "desktop",
  alreadySubmitted = false,
  locked = false,
  lockMessage,
  loginHref,
  onSubmit,
  onDone,
}: {
  form: ApplicationForm
  // The form actually filled in / submitted. Defaults to `form`; for a page
  // channel it is the form referenced by the page's form block.
  applicationForm?: ApplicationForm
  preview?: boolean
  // Public runtime: upsert the lead (answers, stage, step events, UTMs) as the
  // visitor moves. Preview and locked visits stay local.
  persist?: boolean
  respondent?: FunnelRespondent
  device?: "desktop" | "mobile"
  alreadySubmitted?: boolean
  locked?: boolean
  lockMessage?: string
  loginHref?: string
  onSubmit?: (answers: FormAnswer[]) => void
  onDone?: () => void
}) {
  const { t } = useI18n()
  const saveLead = useFormStore((state) => state.saveLead)
  const site = form.site
  const app = applicationForm ?? form
  const [pageId, setPageId] = useState(() => {
    if (!site) return ""
    if (alreadySubmitted) return site.fallbackPageId
    return site.entryPageId
  })
  const [history, setHistory] = useState<string[]>([])
  const [answers, setAnswers] = useState<FormAnswer[]>([])
  const [attempted, setAttempted] = useState(false)
  const answersRef = useRef(answers)
  const finished = useRef(alreadySubmitted)
  const sessionRef = useRef(respondent?.sessionId ?? "")
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    answersRef.current = answers
    if (respondent?.sessionId) sessionRef.current = respondent.sessionId
  }, [answers, respondent?.sessionId])

  useEffect(() => {
    const node = rootRef.current
    const scroller = node?.querySelector("[data-site-scroll]")
    if (scroller instanceof HTMLElement) scroller.scrollTop = 0
    window.scrollTo({ top: 0 })
  }, [pageId])

  const ensureSession = () => {
    if (sessionRef.current) return sessionRef.current
    if (typeof window === "undefined") return ""
    const key = `wesell-funnel-session:${form.id}`
    const existing = window.sessionStorage.getItem(key)
    const next = existing || `sess_${crypto.randomUUID()}`
    if (!existing) window.sessionStorage.setItem(key, next)
    sessionRef.current = next
    return next
  }

  const commit = (events: StepEvent[], stage: string, complete: boolean) => {
    if (preview || !persist) return
    const sessionId = ensureSession()
    if (!sessionId) return
    const current = answersRef.current
    saveLead({
      formId: form.id,
      sessionId,
      creatorId: respondent?.creatorId,
      creatorName: respondent?.creatorName,
      creatorHandle: respondent?.creatorHandle,
      leadEmail: leadEmailOf(app, current),
      answers: current,
      stage,
      complete,
      tracking: readTracking(),
      stepEvents: events,
    })
  }

  const stamp = (): string => new Date().toISOString()

  if (!site) {
    if (locked && !preview) {
      return (
        <div className="mx-auto max-w-md space-y-3 p-6 text-center">
          <p className="text-sm text-zinc-600">{lockMessage ?? t("forms.loginToApply")}</p>
          {loginHref ? (
            <Link href={loginHref}>
              <Button type="button">{t("forms.loginToApply")}</Button>
            </Link>
          ) : null}
        </div>
      )
    }
    return (
      <FormRunner
        form={app}
        preview={preview}
        alreadySubmitted={alreadySubmitted}
        onSubmit={(next) => {
          if (preview) return
          answersRef.current = next
          if (persist) {
            commit([{ pageId: "form", kind: "submit", at: stamp() }], next[next.length - 1]?.questionId ?? "", true)
          }
          onSubmit?.(next)
        }}
        onDone={onDone}
      />
    )
  }

  const page = site.pages.find((item) => item.id === pageId) ?? site.pages[0]
  if (!page) return null

  const finish = () => {
    if (preview || locked || finished.current) return
    finished.current = true
    onSubmit?.(answersRef.current)
  }

  const remember = (questionId: string, value: AnswerValue) => {
    setAnswers((current) => {
      const next = writeAnswer(current, questionId, value)
      answersRef.current = next
      return next
    })
  }

  const runAction = (action: SiteAction, block: SiteBlock) => {
    if (action.kind === "none") return
    if (action.kind === "url") {
      commit([{ pageId: page.id, kind: "click", at: stamp(), blockId: block.id }], page.id, !!page.final)
      if (preview || !action.url) return
      window.open(action.url, "_blank", "noopener,noreferrer")
      return
    }
    if (locked && !preview && pageHasForm(page)) return
    const missing = missingRequired(app, page, answersRef.current)
    if (missing.length > 0) {
      setAttempted(true)
      return
    }
    const score = scoreApplication(app, answersRef.current).score
    const targetId = branchTarget(site, page, action.pageId, score, answersRef.current)
    const target = site.pages.find((item) => item.id === targetId)
    if (!target) return
    const at = stamp()
    commit(
      [
        { pageId: page.id, kind: "advance", at, blockId: block.id },
        { pageId: target.id, kind: "enter", at },
      ],
      target.id,
      !!target.final,
    )
    setHistory((current) => [...current, page.id])
    setPageId(target.id)
    setAttempted(false)
    if (target.final) finish()
  }

  const goBack = () => {
    const previousId = history[history.length - 1]
    if (!previousId) return
    const previous = site.pages.find((item) => item.id === previousId)
    if (!previous) return
    const at = stamp()
    commit(
      [
        { pageId: page.id, kind: "back", at },
        { pageId: previous.id, kind: "enter", at },
      ],
      previous.id,
      !!previous.final,
    )
    setHistory((current) => current.slice(0, -1))
    setPageId(previous.id)
    setAttempted(false)
  }

  const frame = (
    <SiteCanvas
      form={app}
      site={site}
      page={page}
      mode="live"
      className="min-h-[640px]"
      progress={pageProgress(site, page)}
      alreadySubmitted={alreadySubmitted}
      answers={answers}
      invalidQuestionIds={attempted ? missingRequired(app, page, answers) : []}
      onAction={runAction}
      onAnswer={locked && !preview ? undefined : remember}
      onFormDone={onDone}
      footer={
        history.length > 0 ? (
          <Button type="button" variant="outline" size="lg" onClick={goBack} style={{ borderRadius: "var(--site-radius)" }}>
            {t("forms.back")}
          </Button>
        ) : null
      }
      formSlot={
        locked && !preview && pageHasForm(page) ? (
          <div className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-sm text-zinc-600">
              {lockMessage ?? (preview ? t("forms.previewMode") : t("forms.loginToApply"))}
            </p>
            {loginHref ? (
              <Link href={loginHref}>
                <Button type="button">{t("forms.loginToApply")}</Button>
              </Link>
            ) : null}
          </div>
        ) : undefined
      }
    />
  )

  if (device === "mobile") {
    return (
      <div ref={rootRef} className="flex justify-center py-4">
        <div
          data-site-scroll
          className={cn("h-[680px] w-[360px] overflow-y-auto rounded-[28px] border border-zinc-200 bg-white shadow-sm")}
        >
          {frame}
        </div>
      </div>
    )
  }

  return <div ref={rootRef}>{frame}</div>
}
