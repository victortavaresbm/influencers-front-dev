"use client"

import { ContentLibrary } from "@/components/content/content-library"
import { BrandShell } from "@/components/creator/brand-shell"

export default function ContentPage() {
  return (
    <BrandShell manage>
      <ContentLibrary canManage />
    </BrandShell>
  )
}
