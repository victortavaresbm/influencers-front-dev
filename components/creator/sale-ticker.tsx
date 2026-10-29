"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/stores/auth"
import { CREATORS } from "@/lib/mock-data/creators"
import { buildLiveSale } from "@/lib/creator-live-sales"
import { useCreatorSalesStore } from "@/lib/stores/creator-sales"
import { toast } from "@/components/ui/toast"

const INTERVAL_MS = 3 * 60 * 1000

let lastEmitAt = 0

function publishSale(creatorId: string) {
  const now = Date.now()
  if (now - lastEmitAt < 2000) return
  const creator = CREATORS.find((item) => item.id === creatorId)
  if (!creator) return
  const sale = buildLiveSale(creator)
  if (!sale) return
  lastEmitAt = now
  useCreatorSalesStore.getState().push(sale)
  toast.add({
    type: "success",
    timeout: 12000,
    title: "Venda realizada",
    description: `${sale.product} com o cupom ${sale.coupon}`,
    data: {
      kind: "sale",
      product: sale.product,
      brand: sale.brand,
      coupon: sale.coupon,
      commission: sale.commission,
    },
  })
}

export function CreatorSaleTicker() {
  const user = useAuthStore((state) => state.user)
  const creator = CREATORS.find((item) => item.email === user?.email) ?? CREATORS[0]

  useEffect(() => {
    if (user?.role !== "creator") return
    publishSale(creator.id)
    const timer = window.setInterval(() => publishSale(creator.id), INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [creator.id, user?.role])

  return null
}
