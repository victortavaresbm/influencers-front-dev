"use client"

import { Check, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { campaignFit } from "@/lib/discovery/campaign-filters"
import { type Campaign } from "@/lib/mock-data/campaigns"
import { type Creator } from "@/lib/mock-data/creators"
import { cn } from "@/lib/utils"

export function CampaignFitPanel({ campaign, creator }: { campaign: Campaign; creator: Creator }) {
  const fit = campaignFit(campaign, creator)
  const matched = fit.filter((item) => item.matches).length
  const percent = fit.length === 0 ? 0 : Math.round((matched / fit.length) * 100)

  return (
    <div className="space-y-3">
      <Card size="sm">
        <CardHeader>
          <CardTitle>{campaign.name}</CardTitle>
          <CardDescription>
            {matched} de {fit.length} critérios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={percent} aria-label={`${percent}% dos critérios`} />
        </CardContent>
      </Card>
      {fit.map((item) => (
        <div
          key={item.key}
          className={cn(
            "flex items-start gap-2 rounded-lg border p-3",
            item.matches ? "border-emerald-200 bg-emerald-50" : "border-zinc-200"
          )}
        >
          {item.matches ? <Check className="size-4 text-emerald-700" /> : <X className="size-4 text-zinc-400" />}
          <div>
            <p className="text-sm font-medium">{item.label}</p>
            <p className="text-xs text-zinc-500">{item.detail}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
