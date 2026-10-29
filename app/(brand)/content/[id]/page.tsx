"use client"

import { use } from "react"
import { ContentCourse } from "@/components/content/content-course"
import { BrandShell } from "@/components/creator/brand-shell"

export default function ContentCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <BrandShell manage>
      <ContentCourse courseId={id} canManage />
    </BrandShell>
  )
}
