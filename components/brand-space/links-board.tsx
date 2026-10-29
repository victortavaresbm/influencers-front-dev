"use client"

import { useMemo, useState } from "react"
import { useBrandSearch } from "@/components/creator/brand-shell"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CouponTicket } from "@/components/ui/coupon-ticket"
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
import { usePartnerCommunity } from "@/lib/stores/partner-community"

export function LinksBoard({ manage = false }: { manage?: boolean }) {
  const { t } = useI18n()
  const user = useAuthStore((state) => state.user)
  const campaigns = useCampaignStore((state) => state.campaigns)
  const assignTracking = useCampaignStore((state) => state.assignTracking)
  const { selectedId } = usePartnerCommunity()
  const query = useBrandSearch().trim().toLowerCase()
  const creator = CREATORS.find((item) => item.email === user?.email)
  const scopeId = manage ? user?.organizationId : selectedId
  const [open, setOpen] = useState(false)
  const [campaignId, setCampaignId] = useState("")
  const [creatorId, setCreatorId] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [trackingLink, setTrackingLink] = useState("")

  const orgCampaigns = useMemo(
    () => campaigns.filter((campaign) => campaign.organizationId === scopeId),
    [campaigns, scopeId]
  )
  const participants = orgCampaigns.find((campaign) => campaign.id === campaignId)?.participants ?? []

  const links = orgCampaigns.flatMap((campaign) => {
    if (query && !`${campaign.name} ${campaign.organizationName}`.toLowerCase().includes(query)) return []
    return campaign.participants.flatMap((participant) => {
      if (!manage && participant.creatorId !== creator?.id) return []
      if (!participant.couponCode && !participant.trackingLink) return []
      return [{ campaign, participant }]
    })
  })

  function reset() {
    setCampaignId("")
    setCreatorId("")
    setCouponCode("")
    setTrackingLink("")
  }

  function save() {
    if (!campaignId || !creatorId || (!couponCode.trim() && !trackingLink.trim())) return
    assignTracking(campaignId, creatorId, { couponCode, trackingLink })
    setOpen(false)
    reset()
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="space-y-3 p-6">
        {manage && (
          <div className="flex justify-end">
            <Button type="button" onClick={() => setOpen(true)}>
              {t("space.linksNew")}
            </Button>
          </div>
        )}
        {links.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">{t("space.linksEmpty")}</div>
        ) : (
          links.map(({ campaign, participant }) => (
            <Card key={`${campaign.id}-${participant.creatorId}`} className="gap-3 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">{campaign.name}</p>
                <p className="text-xs text-muted-foreground">
                  {manage ? participant.creatorName : campaign.organizationName}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {participant.couponCode && <CouponTicket code={participant.couponCode} size="md" />}
                {participant.trackingLink && (
                  <code className="text-xs text-foreground">{participant.trackingLink}</code>
                )}
              </div>
            </Card>
          ))
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
            <DialogTitle>{t("space.linksNew")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>{t("space.linksCampaign")}</Label>
              <Select
                value={campaignId}
                onValueChange={(value) => {
                  setCampaignId(value ?? "")
                  setCreatorId("")
                }}
              >
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
              <Label>{t("space.linksCreator")}</Label>
              <Select value={creatorId} onValueChange={(value) => setCreatorId(value ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value) => participants.find((participant) => participant.creatorId === value)?.creatorName}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {participants.map((participant) => (
                    <SelectItem key={participant.creatorId} value={participant.creatorId}>
                      {participant.creatorName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="coupon-code">{t("space.linksCoupon")}</Label>
              <Input id="coupon-code" value={couponCode} onChange={(event) => setCouponCode(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tracking-link">{t("space.linksUrl")}</Label>
              <Input id="tracking-link" value={trackingLink} onChange={(event) => setTrackingLink(event.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>{t("pages.cancel")}</DialogClose>
            <Button type="button" onClick={save} disabled={!campaignId || !creatorId || (!couponCode.trim() && !trackingLink.trim())}>
              {t("content.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
