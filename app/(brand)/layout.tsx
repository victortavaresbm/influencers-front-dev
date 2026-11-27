"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/stores/auth"
import { BrandSidebar } from "@/components/layout/brand-sidebar"
import { isRealUser } from "@/components/auth/clerk-bridge"
import { MarcaGate } from "@/components/marca/marca-gate"
import { useMarcaStore } from "@/lib/api/marca"

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const marcaId = useMarcaStore((s) => s.marcaId)

  useEffect(() => {
    // Keeps the path and query (e.g. a store's ?status=ok) for after the login.
    if (!user) router.replace("/login?return=" + encodeURIComponent(window.location.pathname + window.location.search))
    else if (user.role !== "brand") router.replace("/creator/dashboard")
  }, [user, router])

  if (!user || user.role !== "brand") return null
  // A real account acts only inside one of its Marcas; demo logins skip this.
  if (isRealUser(user) && !marcaId) return <MarcaGate />

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <BrandSidebar />
      <main className="ml-14 flex min-h-screen min-w-0 flex-1 flex-col">{children}</main>
    </div>
  )
}
