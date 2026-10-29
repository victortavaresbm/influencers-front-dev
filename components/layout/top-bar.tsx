"use client"
import { useAuthStore } from "@/lib/stores/auth"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CreditBalance } from "@/components/credits/credit-balance"

interface TopBarProps {
  title: string
  subtitle?: string
  leading?: React.ReactNode
  titleAside?: React.ReactNode
  actions?: React.ReactNode
}

export function TopBar({ title, subtitle, leading, titleAside, actions }: TopBarProps) {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white sticky top-0 z-30">
      <div className="flex min-w-0 items-center gap-3">
        {leading && <div className="shrink-0">{leading}</div>}
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-3">
            <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">{title}</h1>
            {titleAside && <div className="shrink-0">{titleAside}</div>}
          </div>
          {subtitle && <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <CreditBalance />
        {actions}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors">
          <Bell size={16} />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-zinc-900" />
        </button>
        <div className="flex items-center gap-2 border-l border-zinc-200 pl-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-semibold">
            {user?.avatar ?? "??"}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-zinc-800 leading-none">{user?.name}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{user?.organizationName}</p>
          </div>
          {user?.plan && (
            <Badge variant="outline" className="text-xs hidden sm:flex">
              {user.plan}
            </Badge>
          )}
        </div>
      </div>
    </header>
  )
}
