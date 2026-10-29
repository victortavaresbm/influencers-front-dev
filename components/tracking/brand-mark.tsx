import Link from "next/link"
import { cn } from "@/lib/utils"
import type { TrackedBrand } from "@/lib/mock-data/tracking"

export function BrandMark({
  brand,
  className,
}: {
  brand: Pick<TrackedBrand, "name" | "initials" | "color" | "ink" | "icon">
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full text-[10px] font-semibold leading-none",
        className,
      )}
      style={{ backgroundColor: brand.color, color: brand.ink === "dark" ? "#18181b" : "#ffffff" }}
    >
      {brand.icon ? (
        <span
          aria-hidden
          className="size-full bg-cover bg-center"
          style={{ backgroundImage: `url(${brand.icon})` }}
        />
      ) : (
        brand.initials
      )}
    </span>
  )
}

export function BrandIdentity({
  brand,
  href,
  markClassName,
}: {
  brand: Pick<TrackedBrand, "name" | "initials" | "color" | "ink" | "icon">
  href?: string
  markClassName?: string
}) {
  const body = (
    <>
      <BrandMark brand={brand} className={markClassName} />
      <span className="font-medium text-zinc-900">{brand.name}</span>
    </>
  )
  if (!href) return <span className="flex items-center gap-2">{body}</span>
  return (
    <Link href={href} className="flex items-center gap-2 rounded-md hover:underline">
      {body}
    </Link>
  )
}
