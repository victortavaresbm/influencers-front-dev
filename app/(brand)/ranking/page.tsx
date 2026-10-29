"use client"

import { RankingBoard } from "@/components/brand-space/ranking-board"
import { BrandShell } from "@/components/creator/brand-shell"

export default function BrandRankingPage() {
  return (
    <BrandShell manage>
      <RankingBoard manage />
    </BrandShell>
  )
}
