import type { Campaign, Participant } from "@/lib/mock-data/campaigns"
import { CREATORS } from "@/lib/mock-data/creators"
import type { MockUser } from "@/lib/mock-data/users"
import type { MessageKey } from "@/lib/i18n"

export type NotificationKind =
  | "application"
  | "delivered"
  | "invite"
  | "selected"
  | "declined"
  | "submitted"
  | "approved"

export interface AppNotification {
  id: string
  kind: NotificationKind
  titleKey: MessageKey
  bodyKey: MessageKey
  vars: Record<string, string>
  createdAt: string
  href: string
}

const COPY: Record<NotificationKind, { titleKey: MessageKey; bodyKey: MessageKey }> = {
  application: { titleKey: "notifications.applicationTitle", bodyKey: "notifications.applicationBody" },
  delivered: { titleKey: "notifications.deliveredTitle", bodyKey: "notifications.deliveredBody" },
  invite: { titleKey: "notifications.inviteTitle", bodyKey: "notifications.inviteBody" },
  selected: { titleKey: "notifications.selectedTitle", bodyKey: "notifications.selectedBody" },
  declined: { titleKey: "notifications.declinedTitle", bodyKey: "notifications.declinedBody" },
  submitted: { titleKey: "notifications.submittedTitle", bodyKey: "notifications.submittedBody" },
  approved: { titleKey: "notifications.approvedTitle", bodyKey: "notifications.approvedBody" },
}

const CREATOR_KIND: Partial<Record<Participant["status"], NotificationKind>> = {
  convidado: "invite",
  selecionado: "selected",
  recusado: "declined",
  candidato: "submitted",
  entregue: "approved",
}

function localIso(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

function day(value?: string) {
  return value?.slice(0, 10)
}

function notificationDate(candidates: Array<string | undefined>, today: string) {
  for (const value of candidates) {
    const iso = day(value)
    if (iso && iso <= today) return iso
  }
  return today
}

function item(
  userId: string,
  campaign: Campaign,
  participant: Participant,
  kind: NotificationKind,
  href: string,
  vars: Record<string, string>,
  today: string,
): AppNotification {
  return {
    id: `${userId}:${campaign.id}:${participant.creatorId}:${kind}`,
    kind,
    ...COPY[kind],
    vars,
    createdAt: notificationDate([participant.lastPost, campaign.updatedAt, campaign.startDate], today),
    href,
  }
}

export function notificationsForUser(user: MockUser, campaigns: Campaign[]): AppNotification[] {
  const today = localIso()
  const items: AppNotification[] = []

  if (user.role === "brand") {
    for (const campaign of campaigns) {
      if (campaign.organizationId !== user.organizationId) continue
      for (const participant of campaign.participants ?? []) {
        const kind = participant.status === "candidato" ? "application" : participant.status === "entregue" ? "delivered" : null
        if (!kind) continue
        items.push(
          item(user.id, campaign, participant, kind, `/campaigns/${campaign.id}`, {
            name: participant.creatorName,
            campaign: campaign.name,
          }, today),
        )
      }
    }
  } else {
    const creator = CREATORS.find((entry) => entry.email.toLowerCase() === user.email.toLowerCase())
    if (!creator) return []
    for (const campaign of campaigns) {
      const participant = campaign.participants?.find((entry) => entry.creatorId === creator.id)
      if (!participant) continue
      const kind = CREATOR_KIND[participant.status]
      if (!kind) continue
      items.push(
        item(user.id, campaign, participant, kind, `/creator/campaigns/${campaign.id}`, {
          name: participant.creatorName,
          brand: campaign.organizationName,
          campaign: campaign.name,
        }, today),
      )
    }
  }

  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id))
}

export function isRecentNotification(createdAt: string, today = localIso()) {
  const [year, month, dayOfMonth] = today.split("-").map(Number)
  const cutoff = new Date(year, month - 1, dayOfMonth)
  cutoff.setDate(cutoff.getDate() - 7)
  const limit = localIso(cutoff)
  return createdAt >= limit
}

export function formatNotificationTime(isoDate: string, locale: string, now = new Date()) {
  const [year, month, dayOfMonth] = isoDate.split("-").map(Number)
  const date = new Date(year, (month || 1) - 1, dayOfMonth || 1, 12, 0, 0)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0)
  const days = Math.round((date.getTime() - today.getTime()) / 86_400_000)
  if (Math.abs(days) < 30) return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(days, "day")
  return date.toLocaleDateString(locale, { day: "2-digit", month: "short" })
}
