"use client"

import { useState } from "react"
import { FileText, ListPlus, UserPlus } from "lucide-react"
import { CreatorReportDialog } from "@/components/discovery/creator-report-dialog"
import { SaveToListDialog } from "@/components/discovery/save-to-list-dialog"
import { CreatorProfile } from "@/components/discovery/creator-profile"
import { ActionsMenu } from "@/components/ui/actions-menu"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { platformProfile, type Platform } from "@/lib/discovery/discover-query"
import { type Campaign } from "@/lib/mock-data/campaigns"
import { type Creator } from "@/lib/mock-data/creators"
import { toast } from "@/components/ui/toast"

export function CreatorSheet({
  creator,
  platform,
  campaign,
  open,
  initialTab,
  onClose,
  onLookalikes,
}: {
  creator: Creator | null
  platform: Platform
  campaign: Campaign | null
  open: boolean
  initialTab: string
  onClose: () => void
  onLookalikes: (creator: Creator) => void
}) {
  const [saveOpen, setSaveOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const profile = creator ? platformProfile(creator, platform) ?? creator.networks[0] : null

  return (
    <>
      <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
        <SheetContent className="gap-0 overflow-hidden bg-zinc-50 p-0 text-foreground data-[side=right]:w-[50vw] data-[side=right]:max-w-[50vw]">
          <SheetHeader className="sr-only">
            <SheetTitle>{creator?.name ?? "Perfil"}</SheetTitle>
          </SheetHeader>
          {creator && profile ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="flex items-center justify-end border-b border-zinc-200 bg-white px-4 py-2 pr-12">
                <ActionsMenu
                  items={[
                    { label: "Salvar na lista", icon: ListPlus, onSelect: () => setSaveOpen(true) },
                    { label: "Relatório", icon: FileText, onSelect: () => setReportOpen(true) },
                  ]}
                />
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <CreatorProfile
                  creator={creator}
                  platform={profile.network}
                  campaign={campaign}
                  initialTab={initialTab}
                  onLookalikes={onLookalikes}
                />
              </div>
            </div>
          ) : (
            <p className="p-6 text-sm text-zinc-500">Este creator não tem perfil nesta rede.</p>
          )}
          {creator && (
            <SheetFooter className="flex-row justify-end border-t border-zinc-200 bg-white">
              <Button
                type="button"
                onClick={() => toast.add({ type: "success", title: "Convite registrado", description: creator.name })}
              >
                <UserPlus />
                Convidar para campanha
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
      <SaveToListDialog creatorId={creator?.id ?? null} creatorName={creator?.name ?? ""} open={saveOpen} onOpenChange={setSaveOpen} />
      {creator && profile && (
        <CreatorReportDialog
          creator={creator}
          platform={profile.network}
          open={reportOpen}
          onOpenChange={setReportOpen}
        />
      )}
    </>
  )
}
