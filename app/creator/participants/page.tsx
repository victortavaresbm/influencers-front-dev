"use client"

import { CommunityMembers } from "@/components/community/community-members"
import { BrandShell } from "@/components/creator/brand-shell"
import { usePartnerCommunity } from "@/lib/stores/partner-community"

export default function CreatorParticipantsPage() {
  const organizationId = usePartnerCommunity().selected?.id

  return (
    <BrandShell>
      <CommunityMembers organizationId={organizationId} />
    </BrandShell>
  )
}
