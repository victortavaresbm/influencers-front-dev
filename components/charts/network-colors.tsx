import type { Network } from "@/lib/mock-data/creators"

export const NETWORK_CHART_COLOR = {
  instagram: { label: "Instagram", tremor: "pink", dot: "bg-pink-500" },
  tiktok: { label: "TikTok", tremor: "black", dot: "bg-zinc-900" },
  youtube: { label: "YouTube", tremor: "red", dot: "bg-red-500" },
} as const satisfies Record<Network, { label: string; tremor: string; dot: string }>

export function networkChartColor(name: string) {
  const key = name.toLowerCase() as Network
  return key in NETWORK_CHART_COLOR ? NETWORK_CHART_COLOR[key] : undefined
}

export function NetworkChartPalette() {
  return (
    <span className="hidden fill-pink-500 stroke-pink-500 text-pink-500 fill-red-500 stroke-red-500 text-red-500 fill-black stroke-black text-black bg-pink-500 bg-red-500" />
  )
}
