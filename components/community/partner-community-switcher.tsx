"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Check, ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useI18n } from "@/lib/i18n"
import { usePartnerCommunity } from "@/lib/stores/partner-community"
import { cn } from "@/lib/utils"

const BRAND_ROUTES = [
  "/creator/community",
  "/creator/participants",
  "/creator/content",
  "/creator/links",
  "/creator/ranking",
  "/creator/materials",
  "/creator/partner",
]

export function PartnerCommunitySwitcher({ variant = "button" }: { variant?: "button" | "icon" | "header" }) {
  const { t } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const { partners, selected, setCommunityId } = usePartnerCommunity()
  const [query, setQuery] = useState("")
  const onBrand = BRAND_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))

  if (!selected || (variant === "button" && partners.length < 2)) return null

  function choose(id: string) {
    setCommunityId(id)
    if (!onBrand) router.push("/creator/community")
  }

  if (variant === "icon" && partners.length < 2) {
    return (
      <Link
        href="/creator/community"
        aria-label={selected.name}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg outline-none hover:bg-zinc-100",
          onBrand && "bg-zinc-100"
        )}
      >
        <CommunityMark name={selected.name} logo={selected.logo} large />
      </Link>
    )
  }

  if (variant === "header" && partners.length < 2) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <CommunityMark name={selected.name} logo={selected.logo} round />
        <span className="truncate text-base font-semibold text-foreground">{selected.name}</span>
      </div>
    )
  }

  const visible = partners.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) setQuery("")
      }}
    >
      {variant === "icon" ? (
        <DropdownMenuTrigger
          aria-label={t("community.switchPartner")}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg outline-none hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-ring",
            onBrand && "bg-zinc-100"
          )}
        >
          <CommunityMark name={selected.name} logo={selected.logo} large />
        </DropdownMenuTrigger>
      ) : variant === "header" ? (
        <DropdownMenuTrigger
          aria-label={t("community.switchPartner")}
          className="flex max-w-56 items-center gap-2 rounded-lg px-1 py-1 outline-none hover:bg-zinc-100 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CommunityMark name={selected.name} logo={selected.logo} round />
          <span className="truncate text-base font-semibold text-foreground">{selected.name}</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>
      ) : (
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="max-w-56"
              aria-label={t("community.switchPartner")}
            />
          }
        >
          <CommunityMark name={selected.name} logo={selected.logo} />
          <span className="truncate">{selected.name}</span>
          <ChevronDown data-icon="inline-end" />
        </DropdownMenuTrigger>
      )}
      <DropdownMenuContent align="start" side={variant === "icon" ? "right" : "bottom"} className="w-72 p-2">
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
            placeholder={t("community.searchPartners")}
            className="pl-8"
            aria-label={t("community.searchPartners")}
          />
        </div>
        <DropdownMenuGroup>
          {visible.map((item) => {
            const active = item.id === selected.id
            return (
              <DropdownMenuItem
                key={item.id}
                onClick={() => choose(item.id)}
                className={active ? "bg-accent" : undefined}
              >
                <CommunityMark name={item.name} logo={item.logo} />
                <span className="min-w-0 flex-1 truncate">{item.name}</span>
                {active && <Check />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
        {visible.length === 0 && (
          <p className="px-2 py-3 text-center text-sm text-muted-foreground">{t("community.noPartners")}</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CommunityMark({
  name,
  logo,
  large = false,
  round = false,
}: {
  name: string
  logo?: string
  large?: boolean
  round?: boolean
}) {
  const box = round
    ? "size-8 rounded-full"
    : large
      ? "size-8 rounded-lg"
      : "size-5 rounded-full"
  if (logo) {
    return <img src={logo} alt="" className={`${box} shrink-0 object-cover`} />
  }
  return (
    <span className={`flex ${box} shrink-0 items-center justify-center bg-primary text-[10px] font-semibold text-primary-foreground`}>
      {name.slice(0, 2)}
    </span>
  )
}
