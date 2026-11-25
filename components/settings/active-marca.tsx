"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { useMarcaStore } from "@/lib/api/marca"
import { useI18n } from "@/lib/i18n"

export function ActiveMarca() {
  const { t } = useI18n()
  const marcaId = useMarcaStore((state) => state.marcaId)
  const setMarcaId = useMarcaStore((state) => state.setMarcaId)
  const [value, setValue] = useState(marcaId ?? "")
  const [invalid, setInvalid] = useState(false)

  const save = (event: React.FormEvent) => {
    event.preventDefault()
    if (!setMarcaId(value)) {
      setInvalid(true)
      return
    }
    setInvalid(false)
    toast.add({ type: "success", title: t("settings.activeMarcaSaved") })
  }

  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold text-zinc-900">{t("settings.activeMarca")}</h2>
      <p className="mt-1 text-sm text-zinc-500">{t("settings.activeMarcaHelp")}</p>
      <form onSubmit={save} className="mt-4 flex gap-2">
        <Input
          aria-label={t("settings.activeMarca")}
          aria-invalid={invalid}
          className="font-mono text-xs"
          placeholder="00000000-0000-0000-0000-000000000000"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <Button type="submit" variant="outline">
          {t("settings.activeMarcaSave")}
        </Button>
      </form>
      {invalid && <p className="mt-2 text-sm text-red-600">{t("settings.activeMarcaInvalid")}</p>}
    </Card>
  )
}
