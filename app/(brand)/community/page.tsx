"use client"

import { CommunityFeed } from "@/components/community/community-feed"
import { BrandShell } from "@/components/creator/brand-shell"

export default function CommunityPage() {
  return (
    <BrandShell manage>
      <CommunityFeed canModerate />
    </BrandShell>
  )
}
