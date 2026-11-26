"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { SiInstagram } from "react-icons/si"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { useApi } from "@/lib/api/use-api"
import { safeAuthorizeUrl } from "@/lib/integrations/stores"
import { SL, describeError, formatDateTime, type InstagramConnection } from "@/lib/meta-discovery/api"

const STATUS_LABEL: Record<InstagramConnection["status"], string> = {
  connected: "Conectado",
  awaiting_messaging_permission: "Aguardando permissão de mensagens",
  disconnected: "Não conectado",
}

const DISCOVERY_LABEL: Record<InstagramConnection["discovery"]["status"], string> = {
  available: "Descoberta disponível",
  missing_permission: "Descoberta: falta permissão",
  brand_not_onboarded: "Descoberta: Marca fora do Creator Marketplace",
  unavailable_disconnected: "Descoberta indisponível",
}

// Real Instagram connection through social-listening (Unified login).
// Meta sends the browser back to /settings/instagram/callback.
export function InstagramIntegration() {
  const { signedIn, marcaId, request } = useApi()
  const [conn, setConn] = useState<InstagramConnection | null>(null)
  const [error, setError] = useState<{ code: string; detail: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const [reloads, setReloads] = useState(0)

  useEffect(() => {
    if (!signedIn || !marcaId) return
    let cancelled = false
    request<InstagramConnection>("GET", `${SL}/instagram/connection`).then(
      (data) => {
        if (cancelled) return
        setConn(data)
        setError(null)
      },
      (err: unknown) => {
        if (!cancelled) setError(describeError(err))
      }
    )
    return () => {
      cancelled = true
    }
  }, [signedIn, marcaId, request, reloads])

  const connect = async () => {
    setBusy(true)
    try {
      const start = await request<{ authorizeUrl?: string }>("POST", `${SL}/instagram/connect`)
      const url = safeAuthorizeUrl(start?.authorizeUrl)
      if (!url) throw new Error("authorizeUrl inválida na resposta")
      window.location.assign(url)
    } catch (err) {
      const e = describeError(err)
      toast.add({ type: "error", title: "Não foi possível iniciar a conexão", description: `${e.code}: ${e.detail}` })
      setBusy(false)
    }
  }

  const disconnect = async () => {
    setBusy(true)
    try {
      await request("DELETE", `${SL}/instagram/connection`)
      toast.add({ type: "success", title: "Instagram desconectado" })
      setReloads((n) => n + 1)
    } catch (err) {
      const e = describeError(err)
      toast.add({ type: "error", title: "Falha ao desconectar", description: `${e.code}: ${e.detail}` })
    } finally {
      setBusy(false)
    }
  }

  const blocked = !signedIn
    ? "Entre com conta real (Clerk) para conectar o Instagram."
    : !marcaId
      ? "Defina a Marca ativa acima para conectar o Instagram."
      : null
  const connected = conn && conn.status !== "disconnected"

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
          <SiInstagram size={18} />
        </span>
        <div className="flex flex-wrap justify-end gap-1">
          {conn && <Badge variant="outline">{STATUS_LABEL[conn.status]}</Badge>}
          {conn && (
            <Badge variant={conn.discovery.status === "available" ? "secondary" : "destructive"}>
              {DISCOVERY_LABEL[conn.discovery.status]}
            </Badge>
          )}
        </div>
      </div>
      <h2 className="mt-3 text-sm font-semibold text-zinc-900">Instagram (Meta · real)</h2>
      <p className="mt-1 text-sm text-zinc-500">
        {conn?.username ? (
          <>
            @{conn.username}
            {conn.updatedAt && <span className="text-zinc-400"> · atualizado {formatDateTime(conn.updatedAt)}</span>}
          </>
        ) : (
          "Conecte a conta Instagram da Marca para buscar creators no Creator Marketplace da Meta."
        )}
      </p>
      {conn?.instruction && <p className="mt-2 text-xs text-amber-700">{conn.instruction}</p>}
      {conn?.discovery.instruction && <p className="mt-2 text-xs text-amber-700">{conn.discovery.instruction}</p>}
      {(blocked || error) && (
        <p className="mt-2 text-xs text-red-600">{blocked ?? `${error!.code}: ${error!.detail}`}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" disabled={!!blocked || busy} onClick={connect}>
          {connected ? "Reconectar" : "Conectar Instagram"}
        </Button>
        {connected && (
          <Button size="sm" variant="outline" disabled={busy} onClick={disconnect}>
            Desconectar
          </Button>
        )}
        {conn?.discovery.status === "available" && (
          <Button size="sm" variant="secondary" render={<Link href="/discovery/meta" />}>
            Abrir busca real
          </Button>
        )}
      </div>
    </Card>
  )
}
