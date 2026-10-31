import { Badge } from "@/components/ui/badge"
import { MEMBERSHIP_ROLE_HELP, MEMBERSHIP_ROLE_LABEL, type MembershipRole } from "@/lib/membership"

export function MembershipBadge({ role }: { role?: MembershipRole }) {
  if (!role) return <span className="text-xs text-zinc-400">Sem tipo</span>
  return (
    <Badge variant="outline" title={MEMBERSHIP_ROLE_HELP[role]}>
      {MEMBERSHIP_ROLE_LABEL[role]}
    </Badge>
  )
}

export function NotTracked() {
  return (
    <span className="text-xs text-zinc-400" title={MEMBERSHIP_ROLE_HELP.affiliate}>
      Não rastreado
    </span>
  )
}
