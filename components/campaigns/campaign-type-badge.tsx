import { Badge } from "@/components/ui/badge"
import { campaignTypeByValue } from "@/lib/campaign-types"
import { cn } from "@/lib/utils"

export function CampaignTypeBadge({ type, className }: { type?: string; className?: string }) {
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
