"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuthStore } from "@/lib/stores/auth"
import { useListStore } from "@/lib/stores/lists"
import { toast } from "@/components/ui/toast"

export function BulkSaveDialog({
  open,
  onOpenChange,
  creatorIds,
  fixedSelection,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  creatorIds: string[]
  fixedSelection: boolean
}) {
  const organizationId = useAuthStore((state) => state.user?.organizationId)
  const lists = useListStore((state) => state.lists)
  const createList = useListStore((state) => state.createList)
  const addCreatorsToList = useListStore((state) => state.addCreatorsToList)
  const mine = lists.filter((list) => list.organizationId === organizationId)
  const [count, setCount] = useState(500)
  const [destination, setDestination] = useState<"new" | "existing">("new")
  const [name, setName] = useState("")
  const [listId, setListId] = useState<string | null>(null)
  const chosen = fixedSelection ? creatorIds : creatorIds.slice(0, count)
  const ready = destination === "new" ? name.trim().length > 0 : Boolean(listId)

  function save() {
    if (!organizationId || !ready || chosen.length === 0) return
    if (destination === "new") {
      createList({
        organizationId,
        name: name.trim(),
        description: "",
        creatorIds: chosen,
      })
      toast.add({
        type: "success",
        title: "Lista criada",
        description: `${chosen.length} perfis em ${name.trim()}.`,
      })
    } else if (listId) {
      addCreatorsToList(listId, chosen)
      const list = mine.find((item) => item.id === listId)
      toast.add({
        type: "success",
        title: "Perfis adicionados",
        description: `${chosen.length} perfis em ${list?.name ?? "lista"}.`,
      })
    }
    setName("")
    setListId(null)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setCount(500)
          setDestination("new")
          setName("")
          setListId(null)
        }
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Salvar em massa</DialogTitle>
          <DialogDescription>
            {fixedSelection
              ? "Os perfis marcados na tabela entram na lista."
              : "Salva os primeiros perfis do resultado, de cima para baixo."}
          </DialogDescription>
        </DialogHeader>
        {!fixedSelection && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="bulk-count">Perfis</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger
                    render={<Button type="button" variant="ghost" size="icon-sm" aria-label="Sobre a quantidade" />}
                  >
                    <Info />
                  </TooltipTrigger>
                  <TooltipContent>
                    A quantidade conta a partir do topo da lista. O máximo é 500, limitado aos resultados atuais ({creatorIds.length}).
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="icon-sm" disabled={count <= 1} onClick={() => setCount((value) => Math.max(1, value - 1))} aria-label="Diminuir">
                −
              </Button>
              <Input
                id="bulk-count"
                inputMode="numeric"
                className="w-24 text-center"
                value={count}
                onChange={(event) => {
                  const digits = Number(event.target.value.replace(/\D/g, ""))
                  if (!digits) {
                    setCount(1)
                    return
                  }
                  setCount(Math.min(500, digits))
                }}
              />
              <Button type="button" variant="outline" size="icon-sm" disabled={count >= 500} onClick={() => setCount((value) => Math.min(500, value + 1))} aria-label="Aumentar">
                +
              </Button>
              <span className="text-xs text-zinc-500">{Math.min(count, creatorIds.length)} disponíveis agora</span>
            </div>
          </div>
        )}
        <RadioGroup value={destination} onValueChange={(value) => setDestination(value as "new" | "existing")}>
          <Label className="font-normal">
            <RadioGroupItem value="new" />
            Criar uma lista nova
          </Label>
          <Label className="font-normal">
            <RadioGroupItem value="existing" />
            Adicionar a uma lista existente
          </Label>
        </RadioGroup>
        {destination === "new" ? (
          <Input value={name} placeholder="Nome da lista" onChange={(event) => setName(event.target.value)} />
        ) : (
          <Select value={listId} onValueChange={(value) => setListId(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Escolha a lista">
                {(value) => mine.find((list) => list.id === value)?.name ?? "Escolha a lista"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {mine.map((list) => (
                <SelectItem key={list.id} value={list.id}>
                  {list.name} ({list.creatorIds.length})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" disabled={!ready || chosen.length === 0} onClick={save}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
