"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { brandCreatorIds } from "@/lib/discovery/scope"
import { CREATORS, type Creator } from "@/lib/mock-data/creators"
import { cn } from "@/lib/utils"

const TIER: Record<Creator["tier"], string> = {
  nano: "Nano",
  micro: "Micro",
  mid: "Mid",
  macro: "Macro",
  mega: "Mega",
}

function followers(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`
  return String(value)
}

export function InviteCreatorsSheet({
  open,
  organizationId,
  participantIds,
  onOpenChange,
  onInvite,
}: {
  open: boolean
  organizationId: string
  participantIds: string[]
  onOpenChange: (open: boolean) => void
  onInvite: (creators: Creator[]) => void
}) {
  const [query, setQuery] = useState("")
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setQuery("")
      setPicked(new Set())
    }
  }

  const taken = useMemo(() => new Set(participantIds), [participantIds])
  const base = useMemo(() => {
    const ids = brandCreatorIds(organizationId)
    return CREATORS.filter((creator) => ids.has(creator.id)).sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR"),
    )
  }, [organizationId])

  const needle = query.trim().toLowerCase()
  const visible = base.filter((creator) => {
    if (!needle) return true
    return `${creator.name} ${creator.handle}`.toLowerCase().includes(needle)
  })
  const selectable = visible.filter((creator) => !taken.has(creator.id))
  const allSelected = selectable.length > 0 && selectable.every((creator) => picked.has(creator.id))
  const selected = base.filter((creator) => picked.has(creator.id) && !taken.has(creator.id))

  function toggle(id: string, checked: boolean) {
    setPicked((current) => {
      const next = new Set(current)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  function toggleAll(checked: boolean) {
    setPicked((current) => {
      const next = new Set(current)
      for (const creator of selectable) {
        if (checked) next.add(creator.id)
        else next.delete(creator.id)
      }
      return next
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        <div className="flex h-full min-h-0 flex-col">
          <SheetHeader className="border-b px-5 py-5 pr-14">
            <SheetTitle>Convidar creators</SheetTitle>
            <SheetDescription>Selecione quem entra nesta campanha. A lista é a sua base.</SheetDescription>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 py-4">
            <div className="relative">
              <Search size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-zinc-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nome ou @"
                className="pl-9"
                aria-label="Buscar creators da base"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <Checkbox
                  checked={allSelected}
                  disabled={selectable.length === 0}
                  onCheckedChange={(checked) => toggleAll(checked === true)}
                  aria-label="Selecionar todos"
                />
                Selecionar todos
              </label>
              <span className="text-xs text-zinc-400">
                {picked.size} selecionado{picked.size === 1 ? "" : "s"} · {base.length} na base
              </span>
            </div>
            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto">
              {visible.map((creator) => {
                const already = taken.has(creator.id)
                return (
                  <li key={creator.id}>
                    <label
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-2 py-2",
                        already ? "opacity-60" : "cursor-pointer hover:bg-zinc-50",
                      )}
                    >
                      <Checkbox
                        checked={already || picked.has(creator.id)}
                        disabled={already}
                        onCheckedChange={(checked) => toggle(creator.id, checked === true)}
                        aria-label={already ? `${creator.name} já está na campanha` : `Selecionar ${creator.name}`}
                      />
                      <Avatar size="sm">
                        <AvatarImage src={creator.photo} alt="" />
                        <AvatarFallback>{creator.avatar}</AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-zinc-900">{creator.name}</span>
                        <span className="block truncate text-xs text-zinc-400">
                          {creator.handle} · {TIER[creator.tier]} · {followers(creator.totalFollowers)}
                        </span>
                      </span>
                      {already ? <Badge variant="secondary">Na campanha</Badge> : null}
                    </label>
                  </li>
                )
              })}
              {base.length === 0 ? (
                <li className="px-2 py-8 text-center text-sm text-zinc-400">Sua base ainda não tem creators.</li>
              ) : null}
              {base.length > 0 && visible.length === 0 ? (
                <li className="px-2 py-8 text-center text-sm text-zinc-400">Nenhum creator encontrado.</li>
              ) : null}
            </ul>
          </div>

          <SheetFooter className="flex-row justify-end border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={selected.length === 0} onClick={() => onInvite(selected)}>
              Convidar
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  )
}
