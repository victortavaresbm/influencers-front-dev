import { Suspense } from "react"
import { InstagramCallback } from "@/components/meta-discovery/instagram-callback"
import { Skeleton } from "@/components/ui/skeleton"

export const instant = false

export default function InstagramCallbackPage() {
  return (
    <Suspense fallback={<Skeleton className="m-6 h-40" />}>
      <InstagramCallback />
    </Suspense>
  )
}
