"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth"
import { CreatorSidebar } from "@/components/layout/creator-sidebar"
import { CreatorSaleTicker } from "@/components/creator/sale-ticker"

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const allowed = user?.role === "creator"

  useEffect(() => {
    if (!user) router.replace("/login")
    else if (user.role !== "creator") router.replace("/dashboard")
  }, [user, router])

  // Always render `{children}` so Cache Components can validate instant navigation.
  // Returning null here drops page segments and triggers instant-unrendered-segment.
  return (
    <div
      className="flex min-h-screen bg-zinc-50"
      style={allowed ? undefined : { visibility: "hidden" }}
      aria-hidden={!allowed}
    >
      <CreatorSidebar />
      <CreatorSaleTicker />
      <main className="ml-14 flex min-h-screen min-w-0 flex-1 flex-col">{children}</main>
    </div>
  )
}
