"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { useApi } from "@/lib/api/use-api"
import { SL, describeError, type ConnectResult, type PendingConnection } from "@/lib/meta-discovery/api"

type State =
  | { kind: "working" }
  | { kind: "pending"; pending: PendingConnection }
  | { kind: "error"; code: string; detail: string }

// Meta redirects here with code/state (or error). The callback must run once:
// the login state is single-use.
export function InstagramCallback() {
  const router = useRouter()
  const { signedIn, marcaId, request } = useApi()
  const [state, setState] = useState<State>({ kind: "working" })
  const [busy, setBusy] = useState(false)
  const sent = useRef(false)

  const done = (username?: string) => {
    toast.add({ type: "success", title: "Instagram conectado", description: username ? `@${username}` : undefined })
    router.replace("/settings?status=instagram_connected")
  }

  useEffect(() => {
    if (sent.current || !signedIn || !marcaId) return
    sent.current = true
    const params = new URLSearchParams(window.location.search)
    const body: Record<string, string> = {}
    for (const key of ["code", "state", "error"]) {
      const value = params.get(key)
      if (value) body[key] = value
    }
    request<ConnectResult>("POST", `${SL}/instagram/callback`, body).then(
      (res) => {
        if (res.outcome === "pending_choice" && res.pendingConnection) setState({ kind: "pending", pending: res.pendingConnection })
        else done(res.socialAccount?.username)
      },
      (err) => setState({ kind: "error", ...describeError(err) })
    )
    // Once, with the session ready.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn, marcaId, request])

  const select = async (pendingId: string, accountId: string) => {
    setBusy(true)
    try {
      const res = await request<ConnectResult>("POST", `${SL}/instagram/pending-connections/${pendingId}/select`, { accountId })
      done(res.socialAccount?.username)
    } catch (err) {
      setState({ kind: "error", ...describeError(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-1 items-start justify-center p-6">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-base font-semibold text-zinc-900">Conectando Instagram</h1>
        {!signedIn || !marcaId ? (
          <p className="mt-2 text-sm text-zinc-500">Aguardando sessão real e Marca ativa…</p>
        ) : state.kind === "working" ? (
          <p className="mt-2 text-sm text-zinc-500">Finalizando login com a Meta…</p>
        ) : state.kind === "pending" ? (
          <div className="mt-3 space-y-2">
            <p className="text-sm text-zinc-500">A Meta liberou mais de uma conta. Escolha a da Marca:</p>
            {state.pending.accounts.map((account) => (
              <Button
                key={account.id}
                variant="outline"
                className="w-full justify-start"
                disabled={busy}
                onClick={() => select(state.pending.id, account.id)}
              >
                @{account.username}
              </Button>
            ))}
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-red-600">
              <span className="font-mono">{state.code}</span>: {state.detail}
            </p>
            <Button variant="outline" render={<Link href="/settings" />}>
              Voltar para Configurações
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
