"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PROFILE_OPEN_LIMIT, SEARCH_LIMIT } from "@/lib/discovery/discover-query"
import { useDiscoverStore } from "@/lib/stores/discover"

export function QuotaBanner() {
  const searchesUsed = useDiscoverStore((state) => state.searchesUsed)
  const openedIds = useDiscoverStore((state) => state.openedIds)
  const trialEndsAt = useDiscoverStore((state) => state.trialEndsAt)
  const [open, setOpen] = useState(false)
  const percent = Math.min(100, searchesUsed)
  const opened = Math.min(PROFILE_OPEN_LIMIT, openedIds.length)
  const days = trialEndsAt == null ? null : Math.max(0, Math.ceil((trialEndsAt - Date.now()) / 86400000))

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-900 px-4 py-2 text-xs text-white">
        <p>
          {opened}/{PROFILE_OPEN_LIMIT} perfis abertos
          <span className="mx-2 text-zinc-500">·</span>
          {percent}% das buscas
          {days != null && (
            <>
              <span className="mx-2 text-zinc-500">·</span>
              {days} {days === 1 ? "dia restante" : "dias restantes"}
            </>
          )}
        </p>
        <Button type="button" size="sm" variant="secondary" onClick={() => setOpen(true)}>
          Upgrade
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cota da descoberta</DialogTitle>
            <DialogDescription>
              Esta conta acompanha até {PROFILE_OPEN_LIMIT} perfis abertos e {SEARCH_LIMIT} buscas no período. A busca continua disponível depois do limite; os planos pagos ainda não estão ligados a esta tela.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
