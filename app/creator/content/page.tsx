"use client"

import { ContentLibrary } from "@/components/content/content-library"
import { BrandShell } from "@/components/creator/brand-shell"

export default function CreatorContentPage() {
  return (
    <BrandShell>
      <ContentLibrary canManage={false} />
    </BrandShell>
  )
}
