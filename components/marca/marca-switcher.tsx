"use client"
import { Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BrandMark } from "@/components/marca/brand-mark"
import { useActiveBrand, useMarcaStore } from "@/lib/api/marca"
import { useI18n } from "@/lib/i18n"

// The Marca selector at the top of the panel, for a real account in more
// than one Marca. Demo logins never see it.
export function MarcaSwitcher() {
  const { t } = useI18n()
  const brands = useMarcaStore((state) => state.brands)
  const select = useMarcaStore((state) => state.select)
  const active = useActiveBrand()
  if (!active || brands.length < 2) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("marca.switch", { name: active.name })}
        className="mb-4 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <BrandMark branding={active.branding} name={active.name} />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" sideOffset={8} className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{t("marca.yourBrands")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {brands.map((brand) => (
            <DropdownMenuItem key={brand.id} onClick={() => select(brand.id)}>
              <BrandMark branding={brand.branding} name={brand.name} className="size-5 text-[10px]" />
              <span className="min-w-0 flex-1 truncate">{brand.name}</span>
              {brand.id.toLowerCase() === active.id.toLowerCase() && <Check className="text-zinc-900" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
