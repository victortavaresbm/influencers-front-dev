"use client"
import { Bell } from "lucide-react"
import { CreditBalance } from "@/components/credits/credit-balance"
import { SuggestionsButton } from "@/components/layout/suggestions-button"
import { UserMenu } from "@/components/layout/user-menu"

interface TopBarProps {
  title: string
  subtitle?: string
  leading?: React.ReactNode
  titleAside?: React.ReactNode
  actions?: React.ReactNode
}

export function TopBar({ title, subtitle, leading, titleAside, actions }: TopBarProps) {
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
        <div className="flex items-center gap-1">
          <SuggestionsButton />
          <button
            type="button"
            className="relative flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 size-2 rounded-full bg-zinc-900" />
          </button>
        </div>
        <UserMenu />
      </div>
    </header>
  )
}
