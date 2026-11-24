"use client"
import { useState } from "react"
import { BookOpen, CalendarDays, Check, GraduationCap, Package, Repeat, type LucideIcon } from "lucide-react"
import type { PickerItem } from "@/lib/campaigns/store-products"
import { cn } from "@/lib/utils"

// Hotmart has no product photo; its product type picks the icon instead.
const FORMAT_ICON: Record<string, LucideIcon> = {
  ONLINE_COURSE: GraduationCap,
  EBOOK: BookOpen,
  AUDIOBOOK: BookOpen,
  ONLINE_EVENT: CalendarDays,
  SUBSCRIPTION: Repeat,
}

export function ProductThumb({ item, className }: { item: Pick<PickerItem, "name" | "imageUrl" | "format">; className?: string }) {
  const [broken, setBroken] = useState(false)
  const Icon = (item.format && FORMAT_ICON[item.format]) || Package
  if (item.imageUrl && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- store CDNs vary; next/image would need each one allowed
      <img
        src={item.imageUrl}
        alt={item.name}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setBroken(true)}
        className={cn("aspect-square w-full object-cover", className)}
      />
    )
  }
  return (
    <span className={cn("flex aspect-square w-full items-center justify-center bg-zinc-100 text-zinc-400", className)}>
      <Icon size={28} aria-hidden="true" />
    </span>
  )
}

export function StoreProductCard({ item, selected, onToggle }: { item: PickerItem; selected: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-white text-left transition-colors",
        selected ? "border-zinc-900 ring-1 ring-zinc-900" : "border-zinc-200 hover:border-zinc-400"
      )}
    >
      <ProductThumb item={item} />
      {selected && (
        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white">
          <Check size={14} aria-hidden="true" />
        </span>
      )}
      <span className="flex flex-1 flex-col gap-1 p-2.5">
        <span className="line-clamp-2 text-sm font-medium text-zinc-900">{item.name}</span>
        {item.priceLabel && <span className="text-xs text-zinc-500">a partir de {item.priceLabel}</span>}
      </span>
    </button>
  )
}
