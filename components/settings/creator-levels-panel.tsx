"use client"

import { useId, useRef, useState, type ReactNode } from "react"
import { ArrowDown, ArrowUp, ChevronDown, Pencil, Plus, Trash2 } from "lucide-react"
import { ActionsMenu } from "@/components/ui/actions-menu"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import {
  INITIAL_CREATOR_LEVEL_GROUPS,
  MEMBER_PROFILES,
  REQUIREMENT_KINDS,
  REWARD_KINDS,
  normalizeLevel,
  requirements,
  rewardUnit,
  rewards,
  type CreatorLevel,
  type CreatorLevelGroup,
  type LevelRequirement,
  type LevelReward,
  type MemberProfile,
  type RequirementKind,
  type RewardKind,
} from "@/lib/creator-levels"
import { type MessageKey, useI18n } from "@/lib/i18n"
import { useAuthStore } from "@/lib/stores/auth"
import { useCreatorLevelsStore } from "@/lib/stores/creator-levels"
import { cn } from "@/lib/utils"

const PROFILE_LABEL: Record<MemberProfile, MessageKey> = {
  creator: "settings.levelsProfile.creator",
  affiliate: "settings.levelsProfile.affiliate",
  researcher: "settings.levelsProfile.researcher",
  ambassador: "settings.levelsProfile.ambassador",
}

const REQUIREMENT_LABEL: Record<RequirementKind, MessageKey> = {
  publications: "settings.levelsReq.publications",
  score: "settings.levelsReq.score",
  sales: "settings.levelsReq.sales",
}

const REQUIREMENT_HELP: Record<RequirementKind, MessageKey> = {
  publications: "settings.levelsReq.publicationsHelp",
  score: "settings.levelsReq.scoreHelp",
  sales: "settings.levelsReq.salesHelp",
}

const REWARD_LABEL: Record<RewardKind, MessageKey> = {
  commission_percent: "settings.levelsReward.commission_percent",
  fixed_commission: "settings.levelsReward.fixed_commission",
  fixed_value: "settings.levelsReward.fixed_value",
  voucher: "settings.levelsReward.voucher",
  commissioned_voucher: "settings.levelsReward.commissioned_voucher",
  first_sale_commission: "settings.levelsReward.first_sale_commission",
  none: "settings.levelsReward.none",
}

const REWARD_HELP: Record<RewardKind, MessageKey> = {
  commission_percent: "settings.levelsReward.commission_percentHelp",
  fixed_commission: "settings.levelsReward.fixed_commissionHelp",
  fixed_value: "settings.levelsReward.fixed_valueHelp",
  voucher: "settings.levelsReward.voucherHelp",
  commissioned_voucher: "settings.levelsReward.commissioned_voucherHelp",
  first_sale_commission: "settings.levelsReward.first_sale_commissionHelp",
  none: "settings.levelsReward.noneHelp",
}

type GroupDraft = { session: number; id: string | null; name: string; profiles: MemberProfile[] }
type LevelDraft = {
  session: number
  groupId: string
  id: string | null
  name: string
  requirements: LevelRequirement[]
  rewards: LevelReward[]
}

function useDraftError(draftKey: string | null) {
  const [error, setErrorState] = useState<{ key: string | null; message: MessageKey | null }>({ key: null, message: null })
  return {
    error: error.key === draftKey ? error.message : null,
    setError: (message: MessageKey | null) => setErrorState({ key: draftKey, message }),
  }
}

function formatDecimal(amount: number) {
  return amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatMoney(amount: number) {
  return `R$ ${formatDecimal(amount)}`
}

function formatRewardAmount(reward: LevelReward) {
  return rewardUnit(reward.kind) === "percent" ? `${reward.amount}%` : formatMoney(reward.amount)
}

export function CreatorLevelsPanel() {
  const { t } = useI18n()
  const organizationId = useAuthStore((state) => state.user?.organizationId)
  const groups = useCreatorLevelsStore((state) =>
    organizationId ? (state.groupsByOrg[organizationId] ?? INITIAL_CREATOR_LEVEL_GROUPS) : []
  )
  const saveGroup = useCreatorLevelsStore((state) => state.saveGroup)
  const deleteGroup = useCreatorLevelsStore((state) => state.deleteGroup)
  const saveLevel = useCreatorLevelsStore((state) => state.saveLevel)
  const deleteLevel = useCreatorLevelsStore((state) => state.deleteLevel)
  const moveLevel = useCreatorLevelsStore((state) => state.moveLevel)
  const [openIds, setOpenIds] = useState<string[]>(() => (groups[0] ? [groups[0].id] : []))
  const [selectedId, setSelectedId] = useState<string | null>(() => groups[0]?.levels[0]?.id ?? null)
  const [groupDraft, setGroupDraft] = useState<GroupDraft | null>(null)
  const [levelDraft, setLevelDraft] = useState<LevelDraft | null>(null)
  const editorSession = useRef(0)
  const nextSession = () => {
    editorSession.current += 1
    return editorSession.current
  }

  const profileLine = (profiles: MemberProfile[]) =>
    t("settings.levelsProfilesLine", {
      profiles: profiles.length > 0 ? profiles.map((profile) => t(PROFILE_LABEL[profile])).join(", ") : t("settings.levelsProfilesNone"),
    })

  const openGroupEditor = (group?: CreatorLevelGroup) => {
    setGroupDraft({
      session: nextSession(),
      id: group?.id ?? null,
      name: group?.name ?? "",
      profiles: group ? [...group.profiles] : [],
    })
  }

  const openLevelEditor = (groupId: string, level?: CreatorLevel) => {
    const normalized = level ? normalizeLevel(level) : null
    setLevelDraft({
      session: nextSession(),
      groupId,
      id: level?.id ?? null,
      name: level?.name ?? "",
      requirements: normalized ? normalized.requirements : requirements({}),
      rewards: normalized ? normalized.rewards : rewards({}),
    })
  }

  const toggleGroup = (id: string) => {
    setOpenIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-2xl">
          <h2 className="text-sm font-semibold text-zinc-900">{t("settings.levels")}</h2>
          <p className="mt-1 text-sm text-zinc-500">{t("settings.levelsHelp")}</p>
        </div>
        <Button type="button" size="sm" onClick={() => openGroupEditor()}>
          <Plus />
          {t("settings.levelsNewGroup")}
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card className="p-5">
          <p className="text-sm text-zinc-500">{t("settings.levelsEmpty")}</p>
        </Card>
      ) : (
        groups.map((group) => {
          const open = openIds.includes(group.id)
          const selectedLevel = group.levels.find((level) => level.id === selectedId)
          return (
            <Card key={group.id} className="p-4">
              <div className="flex items-start gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  aria-expanded={open}
                  onClick={() => toggleGroup(group.id)}
                  className="h-auto min-w-0 flex-1 items-start justify-start px-2 py-1 font-normal whitespace-normal"
                >
                  <ChevronDown className={cn("mt-0.5 text-zinc-500 transition-transform", open ? "" : "-rotate-90")} />
                  <span className="min-w-0 text-left">
                    <span className="block text-sm font-semibold text-zinc-900">{group.name}</span>
                    <span className="mt-1 block text-xs font-normal text-zinc-500">{profileLine(group.profiles)}</span>
                  </span>
                </Button>
                <ActionsMenu
                  items={[
                    { label: t("settings.levelsEditGroup"), icon: Pencil, onSelect: () => openGroupEditor(group) },
                    {
                      label: t("settings.levelsDeleteGroup"),
                      icon: Trash2,
                      destructive: true,
                      onSelect: () => {
                        if (organizationId) deleteGroup(organizationId, group.id)
                        setOpenIds((current) => current.filter((item) => item !== group.id))
                        if (group.levels.some((level) => level.id === selectedId)) setSelectedId(null)
                        toast.add({ type: "success", title: t("settings.levelsRemoved", { name: group.name }) })
                      },
                    },
                  ]}
                />
              </div>

              {open ? (
                <div className="mt-3 space-y-2 border-t border-zinc-200 pt-3">
                  {group.levels.length === 0 ? (
                    <p className="px-2 text-sm text-zinc-500">{t("settings.levelsNoLevels")}</p>
                  ) : (
                    <ul className="space-y-1">
                      {group.levels.map((level, index) => {
                        const normalized = normalizeLevel(level)
                        const selected = selectedId === level.id
                        return (
                          <li key={level.id}>
                            <div className={cn("flex items-center gap-2 rounded-lg pr-1", selected ? "bg-zinc-100" : "hover:bg-zinc-50")}>
                              <Button
                                type="button"
                                variant="ghost"
                                aria-pressed={selected}
                                onClick={() => setSelectedId(level.id)}
                                className="h-auto min-w-0 flex-1 items-start justify-start px-2 py-2 text-left font-normal whitespace-normal hover:bg-transparent"
                              >
                                <span className="min-w-0">
                                  <span className="block text-sm text-zinc-900">
                                    <span className="mr-2 text-xs font-medium text-zinc-400">#{index + 1}</span>
                                    <span className="font-medium">{level.name}</span>
                                  </span>
                                  <span className="mt-0.5 block text-xs text-zinc-500">{describeLevel(normalized, t)}</span>
                                </span>
                              </Button>
                              <div className="w-28 shrink-0 text-right">
                                <p className="text-[11px] leading-4 text-zinc-400">{t("settings.levelsTotalReward")}</p>
                                <p className="text-sm font-medium tabular-nums text-zinc-900">{totalReward(normalized, t)}</p>
                              </div>
                              <ActionsMenu
                                items={[
                                  { label: t("settings.levelsEditLevel"), icon: Pencil, onSelect: () => openLevelEditor(group.id, level) },
                                  ...(index > 0
                                    ? [{ label: t("settings.levelsMoveUp"), icon: ArrowUp, onSelect: () => organizationId && moveLevel(organizationId, group.id, level.id, -1) }]
                                    : []),
                                  ...(index < group.levels.length - 1
                                    ? [{ label: t("settings.levelsMoveDown"), icon: ArrowDown, onSelect: () => organizationId && moveLevel(organizationId, group.id, level.id, 1) }]
                                    : []),
                                  {
                                    label: t("settings.levelsDeleteLevel"),
                                    icon: Trash2,
                                    destructive: true,
                                    onSelect: () => {
                                      if (organizationId) deleteLevel(organizationId, group.id, level.id)
                                      if (selectedId === level.id) setSelectedId(null)
                                      toast.add({ type: "success", title: t("settings.levelsRemoved", { name: level.name }) })
                                    },
                                  },
                                ]}
                              />
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  )}

                  {selectedLevel ? <LevelDetail level={normalizeLevel(selectedLevel)} t={t} /> : null}

                  <div className="px-2 pt-1">
                    <Button type="button" variant="outline" size="sm" onClick={() => openLevelEditor(group.id)}>
                      <Plus />
                      {t("settings.levelsNewLevel")}
                    </Button>
                  </div>
                </div>
              ) : null}
            </Card>
          )
        })
      )}

      <GroupSheet
        draft={groupDraft}
        onChange={setGroupDraft}
        onClose={() => setGroupDraft(null)}
        onSave={(draft) => {
          if (!organizationId) return
          const id = saveGroup(organizationId, { id: draft.id, name: draft.name.trim(), profiles: draft.profiles })
          setOpenIds((current) => (current.includes(id) ? current : [...current, id]))
          setGroupDraft(null)
          toast.add({ type: "success", title: t("settings.levelsSaved") })
        }}
      />
      <LevelSheet
        draft={levelDraft}
        onChange={setLevelDraft}
        onClose={() => setLevelDraft(null)}
        onSave={(draft) => {
          if (!organizationId) return
          const id = saveLevel(organizationId, draft.groupId, {
            id: draft.id,
            name: draft.name.trim(),
            requirements: draft.requirements,
            rewards: draft.rewards,
          })
          if (id) setSelectedId(id)
          setLevelDraft(null)
          toast.add({ type: "success", title: t("settings.levelsSaved") })
        }}
      />
    </div>
  )
}

function describeLevel(
  level: CreatorLevel,
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
) {
  const activeRequirements = level.requirements.filter((item) => item.enabled && item.quantity > 0)
  const activeRewards = level.rewards.filter((item) => item.enabled && (item.kind === "none" || item.amount > 0))
  const score = activeRequirements.find((item) => item.kind === "score")
  const commission = activeRewards.find((item) => item.kind === "commission_percent")
  const voucher = activeRewards.find((item) => item.kind === "voucher")
  if (activeRequirements.length === 1 && score && activeRewards.length === 1 && commission) {
    return t("settings.levels.summaryPointsPercent", { points: score.quantity, percent: commission.amount })
  }
  if (activeRequirements.length === 1 && score && activeRewards.length === 1 && voucher) {
    return t("settings.levels.summaryPointsVoucher", { points: score.quantity, value: formatDecimal(voucher.amount) })
  }
  const parts = [
    ...activeRequirements.map((item) => `${item.quantity} ${t(REQUIREMENT_LABEL[item.kind]).toLowerCase()}`),
    ...activeRewards.map((item) =>
      item.kind === "none" ? t(REWARD_LABEL.none) : `${t(REWARD_LABEL[item.kind])} ${formatRewardAmount(item)}`
    ),
  ]
  return parts.join(" · ")
}

function totalReward(level: CreatorLevel, t: (key: MessageKey, vars?: Record<string, string | number>) => string) {
  const active = level.rewards.filter((item) => item.enabled && (item.kind === "none" || item.amount > 0))
  if (active.length === 0) return "—"
  if (active.every((item) => item.kind === "none")) return t(REWARD_LABEL.none)
  return active
    .filter((item) => item.kind !== "none")
    .map((item) => formatRewardAmount(item))
    .join(" + ")
}

function LevelDetail({
  level,
  t,
}: {
  level: CreatorLevel
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
}) {
  const activeRequirements = level.requirements.filter((item) => item.enabled && item.quantity > 0)
  const activeRewards = level.rewards.filter((item) => item.enabled && (item.kind === "none" || item.amount > 0))

  return (
    <div className="grid gap-4 border-t border-zinc-200 px-2 pt-4 md:grid-cols-2">
      <div>
        <h3 className="mb-2 text-sm font-medium text-zinc-900">{t("settings.levelsRequirements")}</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("settings.levelsType")}</TableHead>
              <TableHead className="text-right">{t("settings.levelsQuantity")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeRequirements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-zinc-500">{t("settings.levelsNoRequirements")}</TableCell>
              </TableRow>
            ) : (
              activeRequirements.map((item) => (
                <TableRow key={item.kind}>
                  <TableCell>{t(REQUIREMENT_LABEL[item.kind])}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium text-zinc-900">{t("settings.levelsRewards")}</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("settings.levelsType")}</TableHead>
              <TableHead className="text-right">{t("settings.levelsValue")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeRewards.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-zinc-500">{t("settings.levelsNoRewards")}</TableCell>
              </TableRow>
            ) : (
              activeRewards.map((item) => (
                <TableRow key={item.kind}>
                  <TableCell>{t(REWARD_LABEL[item.kind])}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.kind === "none" ? "—" : formatRewardAmount(item)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function GroupSheet({
  draft,
  onChange,
  onClose,
  onSave,
}: {
  draft: GroupDraft | null
  onChange: (draft: GroupDraft) => void
  onClose: () => void
  onSave: (draft: GroupDraft) => void
}) {
  const { t } = useI18n()
  const nameId = useId()
  const draftKey = draft ? `${draft.session}:${draft.id ?? "new-group"}` : null
  const { error, setError } = useDraftError(draftKey)

  return (
    <Sheet open={draft != null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="gap-0 p-0">
        {draft ? (
          <form
            className="flex h-full min-h-0 flex-col"
            onSubmit={(event) => {
              event.preventDefault()
              if (!draft.name.trim()) {
                setError("settings.levelsNameRequired")
                return
              }
              setError(null)
              onSave(draft)
            }}
          >
            <SheetHeader className="border-b px-5 py-5 pr-14">
              <SheetTitle className="text-xl">
                {draft.id ? t("settings.levelsGroupTitle") : t("settings.levelsNewGroupTitle")}
              </SheetTitle>
              <SheetDescription>{t("settings.levelsGroupHelp")}</SheetDescription>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
              <div className="grid gap-2">
                <Label htmlFor={nameId}>
                  {t("settings.levelsGroupName")}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={nameId}
                  value={draft.name}
                  placeholder={t("settings.levelsGroupPlaceholder")}
                  onChange={(event) => onChange({ ...draft, name: event.target.value })}
                />
              </div>
              <fieldset className="grid gap-2">
                <legend className="text-sm font-medium text-zinc-900">{t("settings.levelsProfiles")}</legend>
                <p className="text-xs text-zinc-500">{t("settings.levelsProfilesNoneHelp")}</p>
                <div className="mt-1 grid gap-2">
                  {MEMBER_PROFILES.map((profile) => {
                    const checked = draft.profiles.includes(profile)
                    return (
                      <Label key={profile} className="cursor-pointer font-normal">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value) =>
                            onChange({
                              ...draft,
                              profiles:
                                value === true
                                  ? [...draft.profiles, profile]
                                  : draft.profiles.filter((item) => item !== profile),
                            })
                          }
                        />
                        {t(PROFILE_LABEL[profile])}
                      </Label>
                    )
                  })}
                </div>
              </fieldset>
            </div>
            <SheetFooter className="border-t">
              {error ? <p role="alert" className="text-sm text-destructive">{t(error)}</p> : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t("settings.levelsCancel")}
                </Button>
                <Button type="submit">{t("settings.levelsSave")}</Button>
              </div>
            </SheetFooter>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function levelError(draft: LevelDraft): MessageKey | null {
  if (!draft.name.trim()) return "settings.levelsNameRequired"
  const marked = draft.requirements.filter((item) => item.enabled)
  if (marked.length === 0) return "settings.levelsRequirementMissing"
  if (marked.some((item) => item.quantity <= 0)) return "settings.levelsRequirementQuantity"
  const chosen = draft.rewards.filter((item) => item.enabled)
  if (chosen.length === 0) return "settings.levelsRewardRequired"
  if (chosen.some((item) => item.kind !== "none" && item.amount <= 0)) return "settings.levelsRewardAmount"
  return null
}

function LevelSheet({
  draft,
  onChange,
  onClose,
  onSave,
}: {
  draft: LevelDraft | null
  onChange: (draft: LevelDraft) => void
  onClose: () => void
  onSave: (draft: LevelDraft) => void
}) {
  const { t } = useI18n()
  const nameId = useId()
  const draftKey = draft ? `${draft.session}:${draft.groupId}:${draft.id ?? "new-level"}` : null
  const { error, setError } = useDraftError(draftKey)
  const lost = draft?.rewards.some((item) => item.kind === "none" && item.enabled) ?? false

  const setRequirement = (kind: RequirementKind, patch: Partial<LevelRequirement>) => {
    if (!draft) return
    onChange({
      ...draft,
      requirements: draft.requirements.map((item) => (item.kind === kind ? { ...item, ...patch } : item)),
    })
  }

  const setReward = (kind: RewardKind, enabled: boolean) => {
    if (!draft) return
    onChange({
      ...draft,
      rewards: draft.rewards.map((item) => {
        if (kind === "none") {
          if (item.kind === "none") return { ...item, enabled }
          return enabled ? { ...item, enabled: false } : item
        }
        if (item.kind === "none") return { ...item, enabled: false }
        return item.kind === kind ? { ...item, enabled } : item
      }),
    })
  }

  const setRewardAmount = (kind: RewardKind, amount: number) => {
    if (!draft) return
    onChange({
      ...draft,
      rewards: draft.rewards.map((item) => (item.kind === kind ? { ...item, amount } : item)),
    })
  }

  return (
    <Sheet
      open={draft != null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent className="gap-0 p-0">
        {draft ? (
          <form
            className="flex h-full min-h-0 flex-col"
            onSubmit={(event) => {
              event.preventDefault()
              const nextError = levelError(draft)
              if (nextError) {
                setError(nextError)
                return
              }
              setError(null)
              onSave(draft)
            }}
          >
            <SheetHeader className="border-b px-5 py-5 pr-14">
              <SheetTitle className="text-xl">
                {draft.id ? t("settings.levelsEditTitle") : t("settings.levelsNewTitle")}
              </SheetTitle>
              <SheetDescription>{t("settings.levelsSheetHelp")}</SheetDescription>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
              <div className="grid gap-2">
                <Label htmlFor={nameId}>
                  {t("settings.levelsLevelName")}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={nameId}
                  value={draft.name}
                  placeholder={t("settings.levelsLevelPlaceholder")}
                  onChange={(event) => onChange({ ...draft, name: event.target.value })}
                />
              </div>

              <section className="grid gap-2">
                <h3 className="text-sm font-medium text-zinc-900">
                  {t("settings.levelsRequirements")}
                  <span className="ml-0.5 text-destructive">*</span>
                </h3>
                {REQUIREMENT_KINDS.map((kind) => {
                  const item = draft.requirements.find((requirement) => requirement.kind === kind)
                  if (!item) return null
                  return (
                    <RuleRow
                      key={kind}
                      checked={item.enabled}
                      title={t(REQUIREMENT_LABEL[kind])}
                      help={t(REQUIREMENT_HELP[kind])}
                      onCheckedChange={(enabled) => setRequirement(kind, { enabled })}
                      field={
                        item.enabled ? (
                          <NumberField
                            label={t("settings.levelsQuantityField")}
                            value={item.quantity}
                            onChange={(quantity) => setRequirement(kind, { quantity })}
                          />
                        ) : null
                      }
                    />
                  )
                })}
              </section>

              <section className="grid gap-2">
                <h3 className="text-sm font-medium text-zinc-900">
                  {t("settings.levelsRewards")}
                  <span className="ml-0.5 text-destructive">*</span>
                </h3>
                {REWARD_KINDS.map((kind) => {
                  const item = draft.rewards.find((reward) => reward.kind === kind)
                  if (!item) return null
                  const unit = rewardUnit(kind)
                  return (
                    <RuleRow
                      key={kind}
                      checked={item.enabled}
                      disabled={kind !== "none" && lost}
                      title={t(REWARD_LABEL[kind])}
                      help={t(REWARD_HELP[kind])}
                      onCheckedChange={(enabled) => setReward(kind, enabled)}
                      field={
                        item.enabled && unit !== "none" ? (
                          <NumberField
                            label={t(unit === "percent" ? "settings.levelsPercentField" : "settings.levelsMoneyField")}
                            value={item.amount}
                            decimal
                            onChange={(amount) => setRewardAmount(kind, amount)}
                          />
                        ) : null
                      }
                    />
                  )
                })}
              </section>
            </div>
            <SheetFooter className="border-t">
              {error ? <p role="alert" className="text-sm text-destructive">{t(error)}</p> : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t("settings.levelsCancel")}
                </Button>
                <Button type="submit">{t("settings.levelsSave")}</Button>
              </div>
            </SheetFooter>
          </form>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function RuleRow({
  checked,
  disabled,
  title,
  help,
  onCheckedChange,
  field,
}: {
  checked: boolean
  disabled?: boolean
  title: string
  help: string
  onCheckedChange: (checked: boolean) => void
  field: ReactNode
}) {
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border border-zinc-200 px-3 py-3", disabled && "opacity-50")}>
      <Checkbox
        className="mt-0.5"
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        aria-label={title}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-zinc-900">{title}</p>
        <p className="mt-0.5 text-xs text-zinc-500">{help}</p>
      </div>
      {field}
    </div>
  )
}

function NumberField({
  label,
  value,
  decimal,
  onChange,
}: {
  label: string
  value: number
  decimal?: boolean
  onChange: (value: number) => void
}) {
  return (
    <div className="w-28 shrink-0">
      <span className="mb-1 block text-[11px] text-zinc-500">{label}</span>
      <Input
        type="number"
        min={0}
        step={decimal ? "0.01" : "1"}
        inputMode="decimal"
        aria-label={label}
        value={value === 0 ? "" : value}
        onChange={(event) => {
          const next = event.target.value
          if (next === "") {
            onChange(0)
            return
          }
          const parsed = Number(next)
          if (!Number.isNaN(parsed)) onChange(parsed)
        }}
      />
    </div>
  )
}
