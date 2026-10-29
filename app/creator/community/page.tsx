"use client"

import { CommunityFeed } from "@/components/community/community-feed"
import { BrandShell } from "@/components/creator/brand-shell"

export default function CreatorCommunityPage() {
  return (
    <BrandShell>
      <CommunityFeed canModerate={false} />
    </BrandShell>
  )
}
