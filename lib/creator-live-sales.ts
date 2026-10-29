import { CAMPAIGNS } from "@/lib/mock-data/campaigns"
import type { Creator } from "@/lib/mock-data/creators"
import type { LiveSale } from "@/lib/stores/creator-sales"

const PRODUCTS: Record<string, string[]> = {
  Natura: ["Hidratante Ekos", "Óleo de castanha", "Tododia", "Perfume Essencial"],
  "Magazine Luiza": ["Fone Bluetooth", "Air fryer", "Smart TV", "Cafeteira"],
  iFood: ["Pedido no almoço", "Combo família", "Mercado"],
}

const PRICES = [79, 89, 129, 159, 189, 249, 349, 459]

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export function buildLiveSale(creator: Creator): LiveSale | null {
  const options = CAMPAIGNS.flatMap((campaign) => {
    const participant = campaign.participants.find((item) => item.creatorId === creator.id && item.couponCode)
    if (!participant?.couponCode) return []
    return [{ campaign, coupon: participant.couponCode }]
  })
  if (options.length === 0) return null

  const chosen = pick(options)
  const products = PRODUCTS[chosen.campaign.organizationName] ?? ["Pedido na loja", "Kit da campanha"]
  const revenue = pick(PRICES)
  const rate = creator.totalSales ? (creator.totalCommission ?? 0) / creator.totalSales : 0.1
  const commission = Math.max(1, Math.round(revenue * (rate > 0 ? rate : 0.1)))

  return {
    id: `live-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    creatorId: creator.id,
    campaignId: chosen.campaign.id,
    campaign: chosen.campaign.name,
    brand: chosen.campaign.organizationName,
    product: pick(products),
    coupon: chosen.coupon,
    revenue,
    commission,
    at: new Date().toISOString(),
  }
}
