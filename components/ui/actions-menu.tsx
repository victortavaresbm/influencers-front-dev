"use client"

import { MoreHorizontal, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/lib/i18n"

export type ActionMenuItem = {
  label: string
  icon?: LucideIcon
  onSelect?: () => void
  destructive?: boolean
  disabled?: boolean
}

export function ActionsMenu({
  items,
  align = "end",
  label,
  trigger = "label",
}: {
  items: ActionMenuItem[]
  align?: "start" | "center" | "end"
  label?: string
  trigger?: "label" | "ellipsis"
}) {
  const { t } = useI18n()

  if (items.length === 0) return null

  if (items.length === 1 && trigger !== "ellipsis") {
    const item = items[0]
    const Icon = item.icon
    return (
      <Button
        type="button"
        variant={item.destructive ? "destructive" : "outline"}
        size="sm"
        disabled={item.disabled}
        onClick={item.onSelect}
      >
        {Icon ? <Icon /> : null}
        {item.label}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={label ?? t("actions.menu")}
          />
        }
      >
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-auto min-w-44">
        <DropdownMenuGroup>
          {items.map((item) => {
            const Icon = item.icon
            return (
              <DropdownMenuItem
                key={item.label}
                variant={item.destructive ? "destructive" : "default"}
                disabled={item.disabled}
                onClick={item.onSelect}
              >
                {Icon ? <Icon /> : null}
                {item.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
