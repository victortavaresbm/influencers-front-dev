"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth"
import { CreatorSidebar } from "@/components/layout/creator-sidebar"
import { CreatorSaleTicker } from "@/components/creator/sale-ticker"

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!user) router.replace("/login")
    else if (user.role !== "creator") router.replace("/dashboard")
  }, [user, router])

  if (!user || user.role !== "creator") return null

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <CreatorSidebar />
      <CreatorSaleTicker />
      <main className="flex-1 ml-14 flex flex-col min-h-screen">{children}</main>
    </div>
  )
}
