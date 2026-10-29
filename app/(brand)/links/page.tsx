"use client"

import { LinksBoard } from "@/components/brand-space/links-board"
import { BrandShell } from "@/components/creator/brand-shell"

export default function BrandLinksPage() {
  return (
    <BrandShell manage>
      <LinksBoard manage />
    </BrandShell>
  )
}
