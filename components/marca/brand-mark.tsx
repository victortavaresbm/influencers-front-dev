"use client"
import type { Branding } from "@/lib/api/me"
import { cn } from "@/lib/utils"

// A Marca's logo, or its initial over its primary color.
export function BrandMark({ branding, name, className }: { branding: Branding; name: string; className?: string }) {
  const label = branding.name || name
  if (branding.logoUrl) {
    return <img src={branding.logoUrl} alt="" className={cn("size-8 rounded-full object-cover", className)} />
  }
  return (
    <span
      aria-hidden
      className={cn("flex size-8 items-center justify-center rounded-full text-xs font-semibold text-white", className)}
      style={{ backgroundColor: branding.primaryColor || "#18181b" }}
    >
      {label.trim().charAt(0).toUpperCase() || "?"}
    </span>
  )
}
