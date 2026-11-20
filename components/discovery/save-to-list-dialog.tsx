"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/lib/stores/auth"
import { useListStore } from "@/lib/stores/lists"
import { toast } from "@/components/ui/toast"

export function SaveToListDialog({
  creatorId,
  creatorName,
  open,
  onOpenChange,
}: {
  creatorId: string | null
  creatorName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const organizationId = useAuthStore((state) => state.user?.organizationId)
  const lists = useListStore((state) => state.lists)
  const toggleCreatorInList = useListStore((state) => state.toggleCreatorInList)
  const createList = useListStore((state) => state.createList)
  const [text, setText] = useState("")
  const mine = useMemo(
    () => lists.filter((list) => list.organizationId === organizationId),
    [lists, organizationId]
  )
  const visible = mine.filter((list) => list.name.toLowerCase().includes(text.trim().toLowerCase()))
  const canCreate = text.trim().length > 0 && !mine.some((list) => list.name.toLowerCase() === text.trim().toLowerCase())

  function create() {
    if (!organizationId || !creatorId || !canCreate) return
    createList({
      organizationId,
      name: text.trim(),
      description: "",
      creatorIds: [creatorId],
    })
    setText("")
    toast.add({ type: "success", title: "Lista criada", description: text.trim() })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Salvar creator na lista</DialogTitle>
          <DialogDescription>
            {creatorName} pode entrar em várias listas. Digite um nome novo para criar uma.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={text}
          placeholder="Buscar ou criar lista"
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              create()
            }
          }}
        />
        <div className="max-h-64 space-y-2 overflow-y-auto">
          <p className="text-xs font-medium text-zinc-500">Listas criadas por mim</p>
          {visible.length === 0 && !canCreate && (
            <p className="text-sm text-zinc-400">Nenhuma lista com esse nome.</p>
          )}
          {visible.map((list) => {
            const checked = creatorId ? list.creatorIds.includes(creatorId) : false
            return (
              <Label key={list.id} className="items-center gap-2 font-normal">
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => {
                    if (!creatorId) return
                    toggleCreatorInList(list.id, creatorId)
                  }}
                />
                <span className="min-w-0 flex-1 truncate text-sm">{list.name}</span>
                <span className="text-xs text-zinc-400">{list.creatorIds.length}</span>
              </Label>
            )
          })}
          {canCreate && (
            <Button type="button" variant="outline" size="sm" className="w-full justify-start" onClick={create}>
              Criar “{text.trim()}”
            </Button>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
