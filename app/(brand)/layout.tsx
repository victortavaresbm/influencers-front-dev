"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth"
import { BrandSidebar } from "@/components/layout/brand-sidebar"

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!user) router.replace("/login")
    else if (user.role !== "brand") router.replace("/creator/dashboard")
  }, [user, router])

  if (!user || user.role !== "brand") return null

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <BrandSidebar />
      <main className="ml-14 flex min-h-screen min-w-0 flex-1 flex-col">{children}</main>
    </div>
  )
}
