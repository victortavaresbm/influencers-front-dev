"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function FilterMenu({
  value,
  onValueChange,
  options,
  align = "start",
}: {
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
  align?: "start" | "center" | "end"
}) {
  const current = options.find((option) => option.value === value)?.label ?? options[0]?.label

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" className="px-3 font-normal" />}
      >
        {current}
        <ChevronDown data-icon="inline-end" className="text-zinc-400" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-auto min-w-44">
        <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
