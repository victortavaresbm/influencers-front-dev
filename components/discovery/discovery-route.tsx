"use client"

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DiscoverScreen } from "@/components/discovery/discover-screen"
import { isPlatform } from "@/lib/discovery/discover-query"

export function DiscoveryRoute({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = use(params)
  const router = useRouter()

  useEffect(() => {
    if (!isPlatform(platform)) router.replace("/discovery/instagram")
  }, [platform, router])

  if (!isPlatform(platform)) return null
  return <DiscoverScreen key={platform} platform={platform} />
}
