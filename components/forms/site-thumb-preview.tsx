"use client"

import { useEffect, useRef, useState } from "react"
import { SiteCanvas } from "@/components/forms/site-canvas"
import type { FormSite, SitePage } from "@/lib/mock-data/form-site"
import type { ApplicationForm } from "@/lib/mock-data/forms"
import { cn } from "@/lib/utils"

const DESIGN_WIDTH = 1024

export function SiteThumbPreview({
  form,
  site,
  page,
  className,
  children,
}: {
  form: ApplicationForm
  site: FormSite
  page: SitePage
  className?: string
  children?: React.ReactNode
}) {
  const frameRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.3)
  const [shift, setShift] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return
    const update = () => setScale(frame.clientWidth / DESIGN_WIDTH)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!hovering) {
      setShift(0)
      setDuration(0.45)
      return
    }
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShift(0)
      setDuration(0)
      return
    }
    const frame = frameRef.current
    const content = contentRef.current
    if (!frame || !content) return

    const id = requestAnimationFrame(() => {
      const viewport = frame.clientHeight
      const full = content.scrollHeight * scale
      const overflow = Math.max(0, full - viewport)
      if (overflow <= 2) {
        setShift(0)
        setDuration(0)
        return
      }
      setDuration(Math.min(14, Math.max(2.8, overflow / 85)))
      setShift(-(overflow / scale))
    })
    return () => cancelAnimationFrame(id)
  }, [hovering, scale, page, site])

  return (
    <div
      ref={frameRef}
      className={cn("group/thumb relative w-full overflow-hidden bg-white", className)}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        ref={contentRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 origin-top-left will-change-transform motion-reduce:transition-none"
        style={{
          width: DESIGN_WIDTH,
          transform: `scale(${scale}) translateY(${hovering ? shift : 0}px)`,
          transition:
            hovering && duration > 0
              ? `transform ${duration}s linear`
              : `transform ${duration || 0.45}s ease-out`,
        }}
      >
        <SiteCanvas form={form} site={site} page={page} mode="edit" />
      </div>
      {children}
    </div>
  )
}
