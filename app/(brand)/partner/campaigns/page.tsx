"use client"

import { CampaignsBoard } from "@/components/brand-space/campaigns-board"
import { BrandShell } from "@/components/creator/brand-shell"

export default function BrandPartnerCampaignsPage() {
  return (
    <BrandShell manage>
      <CampaignsBoard manage />
    </BrandShell>
  )
}
