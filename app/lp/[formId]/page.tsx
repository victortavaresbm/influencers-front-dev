"use client"

import { Suspense, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SitePlayer } from "@/components/forms/site-player"
import { Button } from "@/components/ui/button"
import { CREATORS } from "@/lib/mock-data/creators"
import type { FormAnswer } from "@/lib/mock-data/forms"
import { campaignAcceptsApplication } from "@/lib/campaign-access"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { useFormStore } from "@/lib/stores/forms"
import { useI18n } from "@/lib/i18n"

export default function LandingPage({ params }: { params: Promise<{ formId: string }> }) {
  return (
    <Suspense fallback={null}>
      <Landing params={params} />
    </Suspense>
  )
}

function Landing({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = use(params)
  const { t } = useI18n()
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const creator = CREATORS.find((item) => item.email === user?.email)
  const forms = useFormStore((state) => state.forms)
  const responses = useFormStore((state) => state.responses)
  const submitResponse = useFormStore((state) => state.submitResponse)
  const campaigns = useCampaignStore((state) => state.campaigns)
  const addParticipant = useCampaignStore((state) => state.addParticipant)
  const form = forms.find((item) => item.id === formId && item.status === "publicado")

  if (!form) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-50">
        <p className="text-sm text-zinc-500">{t("forms.unavailable")}</p>
        <Link href={user?.role === "brand" ? "/forms" : "/creator/opportunities"}>
          <Button variant="outline" size="sm">
            {t("pages.back")}
          </Button>
        </Link>
      </div>
    )
  }

  // In the unified model the funnel is the application itself.
  const app = form

  const campaign = app.campaignId ? campaigns.find((item) => item.id === app.campaignId) : undefined
  const closed =
    app.scope === "campaign" &&
    (!campaign || (creator ? !campaignAcceptsApplication(campaign, creator.id, campaigns) : false))
  const alreadyIn = !!creator && (campaign?.participants.some((participant) => participant.creatorId === creator.id) ?? false)
  const alreadySubmitted = !!creator && responses.some((response) => response.formId === app.id && response.creatorId === creator.id)
  const isBrand = user?.role === "brand"
  const canSubmit = user?.role === "creator" && !!creator && !closed && !alreadyIn && !alreadySubmitted
  const lockMessage = isBrand
    ? t("forms.previewMode")
    : !user
      ? t("forms.loginToApply")
      : alreadyIn
        ? t("forms.alreadyInCampaign")
        : closed
          ? t("forms.closed")
          : undefined

  const submit = (answers: FormAnswer[]) => {
    if (!creator) return
    const saved = submitResponse({
      formId: app.id,
      creatorId: creator.id,
      creatorName: creator.name,
      creatorHandle: creator.handle,
      answers,
    })
    if (!saved || app.scope !== "campaign" || !app.campaignId) return
    addParticipant(app.campaignId, {
      creatorId: creator.id,
      creatorName: creator.name,
      creatorHandle: creator.handle,
      avatar: creator.avatar,
      tier: creator.tier,
      status: "candidato",
      fee: 0,
      deliverables: [],
    })
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-200 bg-background/90 px-4 py-3 backdrop-blur">
        <div>
          <p className="text-sm font-semibold text-zinc-900">{form.organizationName}</p>
          <p className="text-xs text-zinc-500">{form.title}</p>
        </div>
        <Link href={user?.role === "brand" ? `/forms/${form.id}` : user ? "/creator/opportunities" : "/login"}>
          <Button variant="outline" size="sm">
            {t("pages.back")}
          </Button>
        </Link>
      </header>
      <SitePlayer
        form={form}
        applicationForm={app}
        alreadySubmitted={alreadySubmitted}
        locked={!canSubmit}
        lockMessage={lockMessage}
        loginHref={!user ? `/login?return=${encodeURIComponent(`/lp/${form.id}`)}` : undefined}
        preview={isBrand}
        onSubmit={submit}
        onDone={() => router.push("/creator/opportunities")}
      />
    </div>
  )
}
