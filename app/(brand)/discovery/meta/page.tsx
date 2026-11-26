import { Suspense } from "react"
import { MetaDiscoveryScreen } from "@/components/meta-discovery/meta-discovery-screen"
import { Skeleton } from "@/components/ui/skeleton"

export const instant = false

export default function MetaDiscoveryPage() {
  return (
    <Suspense fallback={<Skeleton className="m-6 h-40" />}>
      <MetaDiscoveryScreen />
    </Suspense>
  )
}
