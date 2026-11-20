import { Badge } from "@/components/ui/badge"
import { strategyLabel, tacticLabel } from "@/lib/campaigns/shape"
import { campaignTypeByValue } from "@/lib/campaign-types"
import type { CampaignStrategy, CampaignTactic } from "@/lib/mock-data/campaigns"
import { cn } from "@/lib/utils"

export function CampaignTypeBadge({
  type,
  strategy,
  tactics,
  className,
}: {
  type?: string
  strategy?: CampaignStrategy
  tactics?: CampaignTactic[]
  className?: string
}) {
  if (strategy) {
    const tacticsLabel = (tactics ?? []).map((item) => tacticLabel(item)).filter(Boolean).join(" · ")
    return (
      <Badge variant="outline" className={cn("gap-1", className)}>
        {strategyLabel(strategy)}
        {tacticsLabel ? ` · ${tacticsLabel}` : ""}
      </Badge>
    )
  }
  const meta = campaignTypeByValue(type)
  if (!meta) {
    return (
      <Badge variant="outline" className={className}>
        {type || "—"}
      </Badge>
    )
  }
  const Icon = meta.icon
  return (
    <Badge variant="outline" className={cn("gap-1", className)}>
      <Icon className={meta.iconClass} aria-hidden />
      {meta.label}
    </Badge>
  )
}
