"use client"

import { useState } from "react"
import Link from "next/link"
import { SiteCanvas, SiteShell } from "@/components/forms/site-canvas"
import { FormRunner } from "@/components/forms/form-runner"
import { scoreApplication } from "@/lib/forms/brief-check"
import { pageHasForm, resolveThanksPage, type SiteAction } from "@/lib/mock-data/form-site"
import type { ApplicationForm, FormAnswer } from "@/lib/mock-data/forms"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function SitePlayer({
  form,
  applicationForm,
  preview = false,
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
  device?: "desktop" | "mobile"
  alreadySubmitted?: boolean
  locked?: boolean
  lockMessage?: string
  loginHref?: string
  onSubmit?: (answers: FormAnswer[]) => void
  onDone?: () => void
}) {
  const { t } = useI18n()
  const site = form.site
  const app = applicationForm ?? form
  const [pageId, setPageId] = useState(() => {
    if (!site) return ""
    if (alreadySubmitted) return site.fallbackPageId
    return site.entryPageId
  })
  const [submitted, setSubmitted] = useState(alreadySubmitted)

  if (!site) {
    return (
      <FormRunner
        form={app}
        preview={preview}
        alreadySubmitted={alreadySubmitted}
        onSubmit={onSubmit}
        onDone={onDone}
      />
    )
  }

  const page = site.pages.find((item) => item.id === pageId) ?? site.pages[0]
  if (!page) return null

  const runAction = (action: SiteAction) => {
    if (action.kind === "none") return
    if (action.kind === "page") {
      setPageId(action.pageId)
      return
    }
    if (action.url) {
      if (preview) return
      window.open(action.url, "_blank", "noopener,noreferrer")
    }
  }

  const finish = (answers: FormAnswer[]) => {
    if (!preview) onSubmit?.(answers)
    const score = scoreApplication(app, answers).score
    setSubmitted(true)
    setPageId(resolveThanksPage(site, score, answers))
  }

  const frame = (
    <SiteShell site={site} className="min-h-[640px]">
      <SiteCanvas
        form={app}
        site={site}
        page={page}
        mode="live"
        alreadySubmitted={submitted}
        onAction={runAction}
        onSubmitForm={locked ? undefined : finish}
        onFormDone={onDone}
        formSlot={
          locked && pageHasForm(page) ? (
            <div className="space-y-3 rounded-xl border border-zinc-200 p-4">
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
    </SiteShell>
  )

  if (device === "mobile") {
    return (
      <div className="flex justify-center py-4">
        <div className={cn("h-[680px] w-[360px] overflow-y-auto rounded-[28px] border border-zinc-200 bg-white shadow-sm")}>
          {frame}
        </div>
      </div>
    )
  }

  return frame
}
