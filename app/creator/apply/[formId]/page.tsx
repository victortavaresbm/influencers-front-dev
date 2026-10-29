"use client"

import { Suspense, use } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { Button } from "@/components/ui/button"
import { FormRunner } from "@/components/forms/form-runner"
import { CREATORS } from "@/lib/mock-data/creators"
import type { FormAnswer } from "@/lib/mock-data/forms"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { useFormStore } from "@/lib/stores/forms"
import { campaignAcceptsApplication } from "@/lib/campaign-access"
import { useI18n } from "@/lib/i18n"

export default function ApplyPage({ params }: { params: Promise<{ formId: string }> }) {
  return (
    <Suspense fallback={null}>
      <ApplyForm params={params} />
    </Suspense>
  )
}

function ApplyForm({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = use(params)
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get("return") || "/creator/opportunities"
  const user = useAuthStore((state) => state.user)
  const creator = CREATORS.find((item) => item.email === user?.email) ?? CREATORS[0]
  const forms = useFormStore((state) => state.forms)
  const responses = useFormStore((state) => state.responses)
  const submitResponse = useFormStore((state) => state.submitResponse)
  const campaigns = useCampaignStore((state) => state.campaigns)
  const addParticipant = useCampaignStore((state) => state.addParticipant)
  const form = forms.find((item) => item.id === formId && item.status === "publicado")

  if (!form) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <p className="text-sm text-zinc-500">{t("forms.unavailable")}</p>
        <Link href={returnTo}>
          <Button variant="outline" size="sm">{t("pages.back")}</Button>
        </Link>
      </div>
    )
  }

  const campaign = form.campaignId ? campaigns.find((item) => item.id === form.campaignId) : undefined
  const closed =
    form.scope === "campaign" &&
    (!campaign || !campaignAcceptsApplication(campaign, creator.id, campaigns))
  const alreadyIn = campaign?.participants.some((participant) => participant.creatorId === creator.id) ?? false
  const alreadySubmitted = responses.some(
    (response) => response.formId === form.id && response.creatorId === creator.id,
  )

  const submit = (answers: FormAnswer[]) => {
    const saved = submitResponse({
      formId: form.id,
      creatorId: creator.id,
      creatorName: creator.name,
      creatorHandle: creator.handle,
      answers,
    })
    if (!saved || form.scope !== "campaign" || !form.campaignId) return
    addParticipant(form.campaignId, {
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
    <div className="flex flex-1 flex-col">
      <TopBar
        title={form.title}
        subtitle={form.organizationName}
        leading={
          <Link href={returnTo}>
            <Button variant="outline" size="sm">
              <ArrowLeft />
              {t("pages.back")}
            </Button>
          </Link>
        }
      />
      <div className="flex flex-1 items-center justify-center p-6">
        {closed || (alreadyIn && !alreadySubmitted) ? (
          <div className="max-w-md space-y-3 text-center">
            <p className="text-sm text-zinc-600">{alreadyIn ? t("forms.alreadyInCampaign") : t("forms.closed")}</p>
            <Link href={returnTo}>
              <Button variant="outline">{t("pages.back")}</Button>
            </Link>
          </div>
        ) : (
          <FormRunner
            form={form}
            alreadySubmitted={alreadySubmitted}
            onSubmit={submit}
            onDone={() => router.push(returnTo)}
          />
        )}
      </div>
    </div>
  )
}
