"use client"

import { MaterialsBoard } from "@/components/brand-space/materials-board"
import { BrandShell } from "@/components/creator/brand-shell"

export default function BrandMaterialsPage() {
  return (
    <BrandShell manage>
      <MaterialsBoard manage />
    </BrandShell>
  )
}
