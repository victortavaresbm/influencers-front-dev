"use client"

import { useState } from "react"
import { useBrandSearch } from "@/components/creator/brand-shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CREATORS } from "@/lib/mock-data/creators"
import { useI18n } from "@/lib/i18n"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { useMaterialsStore } from "@/lib/stores/materials"
import { usePartnerCommunity } from "@/lib/stores/partner-community"

export function MaterialsBoard({ manage = false }: { manage?: boolean }) {
  const { t } = useI18n()
  const user = useAuthStore((state) => state.user)
  const campaigns = useCampaignStore((state) => state.campaigns)
  const added = useMaterialsStore((state) => state.added)
  const addMaterial = useMaterialsStore((state) => state.addMaterial)
  const { selectedId } = usePartnerCommunity()
  const query = useBrandSearch().trim().toLowerCase()
  const creator = CREATORS.find((item) => item.email === user?.email)
  const scopeId = manage ? user?.organizationId : selectedId
  const [open, setOpen] = useState(false)
  const [campaignId, setCampaignId] = useState("")
  const [title, setTitle] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  const orgCampaigns = campaigns.filter((campaign) => campaign.organizationId === scopeId)
  const fromCovers = orgCampaigns.flatMap((campaign) => {
    if (!campaign.coverImage) return []
    if (!manage && !campaign.participants.some((participant) => participant.creatorId === creator?.id)) return []
    return [{
      id: `cover-${campaign.id}`,
      organizationId: campaign.organizationId,
      campaignId: campaign.id,
      title: campaign.name,
      imageUrl: campaign.coverImage,
    }]
  })
  const extras = added.filter((material) => {
    if (material.organizationId !== scopeId) return false
    if (manage) return true
    const campaign = campaigns.find((item) => item.id === material.campaignId)
    return campaign?.participants.some((participant) => participant.creatorId === creator?.id) ?? false
  })
  const materials = [...fromCovers, ...extras].filter(
    (material) => !query || material.title.toLowerCase().includes(query)
  )

  function reset() {
    setCampaignId("")
    setTitle("")
    setImageUrl("")
  }

  function save() {
    if (!scopeId || !campaignId || !title.trim() || !imageUrl.trim()) return
    addMaterial({
      organizationId: scopeId,
      campaignId,
      title: title.trim(),
      imageUrl: imageUrl.trim(),
    })
    setOpen(false)
    reset()
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="p-6">
        {manage && (
          <div className="mb-4 flex justify-end">
            <Button type="button" onClick={() => setOpen(true)}>
              {t("space.materialsNew")}
            </Button>
          </div>
        )}
        {materials.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">{t("space.materialsEmpty")}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {materials.map((material) => (
              <Card key={material.id} className="overflow-hidden !pt-0">
                <img src={material.imageUrl} alt="" className="h-36 w-full object-cover" />
                <div className="p-4">
                  <p className="line-clamp-2 text-sm font-semibold text-foreground">{material.title}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) reset()
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("space.materialsNew")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>{t("space.linksCampaign")}</Label>
              <Select value={campaignId} onValueChange={(value) => setCampaignId(value ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value) => orgCampaigns.find((campaign) => campaign.id === value)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {orgCampaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="material-title">{t("space.materialsTitle")}</Label>
              <Input id="material-title" value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="material-image">{t("space.materialsImage")}</Label>
              <Input id="material-image" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>{t("pages.cancel")}</DialogClose>
            <Button type="button" onClick={save} disabled={!campaignId || !title.trim() || !imageUrl.trim()}>
              {t("content.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
