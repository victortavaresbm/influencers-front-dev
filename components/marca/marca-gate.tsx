"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { BrandMark } from "@/components/marca/brand-mark"
import { apiErrorMessage } from "@/lib/api/errors"
import { refreshMemberships, useMarcaStore } from "@/lib/api/marca"
import { acceptInvitationPath } from "@/lib/api/me"
import { useApi } from "@/lib/api/use-api"
import { useI18n } from "@/lib/i18n"
import { useAuthStore } from "@/lib/stores/auth"

// Shown instead of the panel while the real account has no active Marca:
// loading, no Marca yet (with its pending invitations) or the Marca picker.
export function MarcaGate() {
  const { t } = useI18n()
  const api = useApi()
  const status = useMarcaStore((state) => state.status)
  const error = useMarcaStore((state) => state.error)
  const brands = useMarcaStore((state) => state.brands)
  const invitations = useMarcaStore((state) => state.invitations)
  const select = useMarcaStore((state) => state.select)
  const logout = useAuthStore((state) => state.logout)
  const [accepting, setAccepting] = useState<string | null>(null)

  const accept = async (id: string, marcaId: string) => {
    setAccepting(id)
    try {
      await api.request("POST", acceptInvitationPath(id))
      await refreshMemberships(api.getToken)
      useMarcaStore.getState().select(marcaId)
    } catch (err) {
      toast.add({ type: "error", title: apiErrorMessage(t, err) })
    } finally {
      setAccepting(null)
    }
  }

  let body: React.ReactNode
  if (status === "idle" || status === "loading") {
    body = <p className="text-sm text-zinc-500">{t("marca.loading")}</p>
  } else if (status === "error") {
    body = (
      <>
        <p className="text-sm text-zinc-500">{t("marca.loadFailed")}</p>
        <p className="mt-1 text-xs text-zinc-400">{apiErrorMessage(t, error)}</p>
        <Button className="mt-4" variant="outline" onClick={() => void refreshMemberships(api.getToken)}>
          {t("marca.retry")}
        </Button>
      </>
    )
  } else if (brands.length > 0) {
    body = (
      <>
        <h1 className="text-lg font-semibold text-zinc-900">{t("marca.pickTitle")}</h1>
        <ul className="mt-4 flex flex-col gap-2">
          {brands.map((brand) => (
            <li key={brand.id}>
              <button
                type="button"
                onClick={() => select(brand.id)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 p-3 text-left hover:bg-zinc-50"
              >
                <BrandMark branding={brand.branding} name={brand.name} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-zinc-900">{brand.name}</span>
                  <span className="block text-xs text-zinc-500">{t(brand.role === "owner" ? "marca.roleOwner" : "marca.roleManager")}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </>
    )
  } else {
    body = (
      <>
        <h1 className="text-lg font-semibold text-zinc-900">{t("marca.noneTitle")}</h1>
        {invitations.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">{t("marca.noneHelp")}</p>
        ) : (
          <>
            <p className="mt-2 text-sm text-zinc-500">{t("marca.invitationsHelp")}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {invitations.map((inv) => (
                <li key={inv.id} className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3">
                  <BrandMark branding={inv.brand.branding} name={inv.brand.name} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-zinc-900">{inv.brand.name}</span>
                    <span className="block text-xs text-zinc-500">{t(inv.role === "owner" ? "marca.roleOwner" : "marca.roleManager")}</span>
                  </span>
                  <Button size="sm" disabled={accepting !== null} onClick={() => void accept(inv.id, inv.brand.id)}>
                    {accepting === inv.id ? t("marca.accepting") : t("marca.accept")}
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <Card className="w-full max-w-md p-6">
        {body}
        {/* Always a way out: the login page sends a real session back here. */}
        <Button className="mt-6" variant="ghost" size="sm" onClick={logout}>
          {t("nav.logout")}
        </Button>
      </Card>
    </div>
  )
}
