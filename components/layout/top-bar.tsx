"use client"
import { HeaderUtilities } from "@/components/layout/header-utilities"
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
        {actions}
        <HeaderUtilities />
        <UserMenu />
      </div>
    </header>
  )
}
