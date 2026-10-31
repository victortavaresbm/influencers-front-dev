"use client"

import { useEffect, useRef, useState } from "react"
import { Plus, Presentation } from "lucide-react"
import { AddCardSheet } from "@/components/dashboard/add-card-sheet"
import { DashboardCanvas } from "@/components/dashboard/dashboard-canvas"
import { DashboardDataProvider } from "@/components/dashboard/dashboard-data"
import { TopBar } from "@/components/layout/top-bar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/lib/i18n"
import { useAuthStore } from "@/lib/stores/auth"
import { useDashboardStore } from "@/lib/stores/dashboard"

export default function DashboardPage() {
  const { t } = useI18n()
  const user = useAuthStore((state) => state.user)
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [presenting, setPresenting] = useState(false)
  const [ready, setReady] = useState(() => useDashboardStore.persist.hasHydrated())

  useEffect(() => {
    const unsub = useDashboardStore.persist.onFinishHydration(() => setReady(true))
    if (!useDashboardStore.persist.hasHydrated()) void useDashboardStore.persist.rehydrate()
    return unsub
  }, [])

  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) setPresenting(false)
    }
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  useEffect(() => {
    if (!presenting) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setPresenting(false)
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [presenting])

  function startPresentation() {
    setOpen(false)
    setPresenting(true)
    const node = rootRef.current
    if (node?.requestFullscreen) void node.requestFullscreen().catch(() => {})
  }

  function stopPresentation() {
    setPresenting(false)
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
  }

  return (
    <div
      ref={rootRef}
      className={presenting ? "fixed inset-0 z-50 flex flex-col overflow-auto bg-zinc-50" : "flex flex-1 flex-col"}
    >
      {presenting ? (
        <div className="sticky top-0 z-20 flex justify-end bg-zinc-50/90 px-6 py-3 backdrop-blur-sm">
          <Button type="button" variant="outline" size="sm" onClick={stopPresentation}>
            {t("dashboard.exitPresent")}
          </Button>
        </div>
      ) : (
        <TopBar
          title="Dashboard"
          subtitle={t("dashboard.welcome", { name: user?.name?.split(" ")[0] ?? "" })}
          actions={
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={startPresentation}>
                <Presentation />
                {t("dashboard.present")}
              </Button>
              <Button type="button" size="sm" onClick={() => setOpen(true)}>
                <Plus />
                {t("dashboard.addCard")}
              </Button>
            </div>
          }
        />
      )}
      <DashboardDataProvider>
        <div className={presenting ? "px-6 pt-14 pb-8" : "p-6"}>
          {ready ? (
            <DashboardCanvas editable={!presenting} onAdd={() => setOpen(true)} />
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <Skeleton key={index} className="h-28 rounded-xl" />
              ))}
              <Skeleton className="col-span-2 h-72 rounded-xl lg:col-span-3" />
              <Skeleton className="col-span-2 h-72 rounded-xl lg:col-span-1" />
            </div>
          )}
        </div>
        <AddCardSheet open={open} onOpenChange={setOpen} />
      </DashboardDataProvider>
    </div>
  )
}
