import { Flame, Store, type LucideIcon } from "lucide-react"
import { SiShopify } from "react-icons/si"
import type { IconType } from "react-icons"
import type { StorePlatform } from "@/lib/integrations/stores"

export const PLATFORMS: { id: StorePlatform; name: string; icon: LucideIcon | IconType }[] = [
  { id: "nuvemshop", name: "Nuvemshop", icon: Store },
  { id: "shopify", name: "Shopify", icon: SiShopify },
  { id: "hotmart", name: "Hotmart", icon: Flame },
]

export function platformMeta(platform: string) {
  return PLATFORMS.find((p) => p.id === platform) ?? { id: platform, name: platform, icon: Store }
}
