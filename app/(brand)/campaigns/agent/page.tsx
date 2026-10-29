"use client"

import Link from "next/link"
import { CampaignAgent } from "@/components/campaigns/campaign-agent"
import { TopBar } from "@/components/layout/top-bar"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

export default function CampaignAgentPage() {
  const { t } = useI18n()

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={t("agent.title")}
        subtitle={t("agent.subtitle")}
        actions={
          <Button variant="outline" size="sm" render={<Link href="/campaigns" />}>
            {t("pages.cancel")}
          </Button>
        }
      />
      <CampaignAgent />
    </div>
  )
}
