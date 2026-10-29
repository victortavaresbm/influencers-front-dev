"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import type { Creator } from "@/lib/mock-data/creators"

const DEFAULT_DESCRIPTION =
  "Dê um nome, descreva a lista e escolha creators favoritos da busca ou que já estão na comunidade da marca."

export function NewListSheet({
  open,
  candidates,
  initialCreatorIds = [],
  description = DEFAULT_DESCRIPTION,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  candidates: { creator: Creator; favorite: boolean; community: boolean }[]
  initialCreatorIds?: string[]
  description?: string
  onOpenChange: (open: boolean) => void
  onCreate: (input: { name: string; description: string; creatorIds: string[] }) => void
}) {
  const [name, setName] = useState("")
  const [details, setDetails] = useState("")
  const [query, setQuery] = useState("")
  const [picked, setPicked] = useState<Set<string>>(() => new Set(initialCreatorIds))
  const [wasOpen, setWasOpen] = useState(open)

  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setName("")
      setDetails("")
      setQuery("")
      setPicked(new Set(initialCreatorIds))
    }
  }

  const visible = candidates.filter((item) => {
    const text = `${item.creator.name} ${item.creator.handle}`.toLowerCase()
    return text.includes(query.trim().toLowerCase())
  })

  function toggle(id: string, checked: boolean) {
    setPicked((current) => {
      const next = new Set(current)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
        <form
          className="flex h-full min-h-0 flex-col"
          onSubmit={(event) => {
            event.preventDefault()
            if (!name.trim()) return
            onCreate({
              name: name.trim(),
              description: details.trim(),
              creatorIds: [...picked],
            })
          }}
        >
          <SheetHeader className="border-b px-5 py-5 pr-14">
            <SheetTitle>Nova lista</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="list-name">Nome</Label>
              <Input
                id="list-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex.: Parceiros do verão"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="list-description">Descrição</Label>
              <Textarea
                id="list-description"
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="Para que serve esta lista"
              />
            </div>
            <div className="grid min-h-0 gap-2">
              <div className="flex items-center justify-between gap-3">
                <Label>Influencers</Label>
                <span className="text-xs text-zinc-400">{picked.size} selecionado{picked.size === 1 ? "" : "s"}</span>
              </div>
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nome ou @"
              />
              <ul className="flex flex-col gap-1">
                {visible.map(({ creator, favorite, community }) => (
                  <li key={creator.id}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-zinc-50">
                      <Checkbox
                        checked={picked.has(creator.id)}
                        onCheckedChange={(checked) => toggle(creator.id, checked === true)}
                      />
                      {creator.photo ? (
                        <img src={creator.photo} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700">
                          {creator.avatar}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex min-w-0 items-center gap-1.5">
                          <span className="truncate text-sm font-medium text-zinc-900">{creator.name}</span>
                          {favorite && (
                            <Star size={14} className="shrink-0 fill-zinc-900 text-zinc-900" aria-label="Favorito" />
                          )}
                        </span>
                        <span className="block truncate text-xs text-zinc-400">{creator.handle}</span>
                      </span>
                      {community && <Badge className="shrink-0">Comunidade</Badge>}
                    </label>
                  </li>
                ))}
                {visible.length === 0 && (
                  <li className="px-2 py-6 text-center text-sm text-zinc-400">Nenhum influencer encontrado.</li>
                )}
              </ul>
            </div>
          </div>

          <SheetFooter className="flex-row justify-end border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Salvar
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
