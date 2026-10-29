"use client"

import { CommunityMembers } from "@/components/community/community-members"
import { BrandShell } from "@/components/creator/brand-shell"
import { useAuthStore } from "@/lib/stores/auth"

export default function ParticipantsPage() {
  const organizationId = useAuthStore((state) => state.user?.organizationId)

  return (
    <BrandShell manage>
      <CommunityMembers organizationId={organizationId} />
    </BrandShell>
  )
}
