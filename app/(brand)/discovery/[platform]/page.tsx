import { Suspense } from "react"
import { DiscoveryRoute } from "@/components/discovery/discovery-route"
import { Skeleton } from "@/components/ui/skeleton"

export const instant = false

export default function DiscoveryPlatformPage({ params }: { params: Promise<{ platform: string }> }) {
  return (
    <Suspense fallback={<Skeleton className="m-6 h-40" />}>
      <DiscoveryRoute params={params} />
    </Suspense>
  )
}
