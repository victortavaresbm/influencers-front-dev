"use client"

import Link from "next/link"
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactElement } from "react"
import type { LucideIcon } from "lucide-react"
import UseAnimations, {
  type Animation,
  type AnimationProps,
  type EventProps,
} from "react-useanimations"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { DayHealth } from "@/lib/schedule"

const itemClass = (active?: boolean) =>
  cn(
    "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
    active
      ? "bg-zinc-900 text-white"
      : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
  )

function SidebarIcon({
  animation,
  onClick,
  children,
}: {
  animation: Animation
  onClick?: () => void
  children: (eventProps: EventProps, animationProps: AnimationProps) => ReactElement
}) {
  return (
    <UseAnimations
      animation={animation}
      size={24}
      interaction="hover"
      onClick={onClick}
      render={children}
    />
  )
}

const HEALTH_DOT: Record<DayHealth, string> = {
  ok: "bg-emerald-500",
  atencao: "bg-amber-500",
  atraso: "bg-red-500",
}

function StatusDot({ health }: { health?: DayHealth | null }) {
  if (!health) return null
  return <span className={cn("absolute top-1 right-1 size-1.5 rounded-full ring-2 ring-white", HEALTH_DOT[health])} />
}

export function SidebarIconLink({
  href,
  animation,
  icon: Icon,
  label,
  active,
  health,
}: {
  href: string
  label: string
  active?: boolean
  health?: DayHealth | null
} & ({ animation: Animation; icon?: never } | { icon: LucideIcon; animation?: never })) {
  if (Icon) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Link href={href} aria-label={label} className={cn(itemClass(active), "relative")} />
          }
        >
          <Icon className="size-5" strokeWidth={1.75} />
          <StatusDot health={health} />
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <SidebarIcon animation={animation}>
      {(eventProps, animationProps) => (
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href={href}
                aria-label={label}
                className={cn(itemClass(active), "relative")}
                {...(eventProps as AnchorHTMLAttributes<HTMLAnchorElement>)}
              />
            }
          >
            <span {...animationProps} />
            <StatusDot health={health} />
          </TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      )}
    </SidebarIcon>
  )
}

export function SidebarIconButton({
  animation,
  label,
  onClick,
}: {
  animation: Animation
  label: string
  onClick: () => void
}) {
  return (
    <SidebarIcon animation={animation} onClick={onClick}>
      {(eventProps, animationProps) => (
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label={label}
                className={itemClass()}
                {...(eventProps as ButtonHTMLAttributes<HTMLButtonElement>)}
              />
            }
          >
            <span {...animationProps} />
          </TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      )}
    </SidebarIcon>
  )
}
