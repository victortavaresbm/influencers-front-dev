"use client"

import { use } from "react"
import { ContentCourse } from "@/components/content/content-course"
import { BrandShell } from "@/components/creator/brand-shell"

export default function CreatorContentCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <BrandShell>
      <ContentCourse courseId={id} canManage={false} />
    </BrandShell>
  )
}