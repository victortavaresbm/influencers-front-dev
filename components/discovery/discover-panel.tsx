"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { Bookmark, Check, ImagePlus, Plus, UserRound } from "lucide-react"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import { LocationField } from "@/components/discovery/location-field"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ACCOUNT_TYPE_LABEL,
  AGE_STEPS,
  ENGAGEMENT_STEPS,
  FAKE_STEPS,
  FOLLOWER_STEPS,
  FREQUENCY_LABEL,
  GENDER_LABEL,
  GROWTH_STEPS,
  LANGUAGES,
  NICHES,
  POSTED_WITHIN,
  VIEW_STEPS,
  brandIndex,
  extractPrompt,
  formatCompact,
  hashtagIndex,
  isPlatform,
  isQueryActive,
  mentionIndex,
  PLATFORMS,
  postedWithinEnabled,
  queryFromFilterState,
  sectionCounts,
  selectedNetworks,
  type AccountType,
  type DiscoverQuery,
  type GenderFilter,
  type Platform,
  type PostingFrequency,
} from "@/lib/discovery/discover-query"
import { type Creator } from "@/lib/mock-data/creators"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { useDiscoverStore } from "@/lib/stores/discover"
import { useFilterPresetStore } from "@/lib/stores/filter-presets"
import { useAuthStore } from "@/lib/stores/auth"
import { fold } from "@/lib/discovery/scope"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

const NETWORK_MARK: Record<Platform, { label: string; className: string; icon: typeof SiInstagram }> = {
  instagram: {
    label: "Instagram",
    className: "bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285AEB_90%)] hover:bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285AEB_90%)]",
    icon: SiInstagram,
  },
  tiktok: { label: "TikTok", className: "bg-zinc-950 hover:bg-zinc-950", icon: SiTiktok },
  youtube: { label: "YouTube", className: "bg-[#ff0033] hover:bg-[#ff0033]", icon: SiYoutube },
}

function choice(value: string | null) {
  return !value || value === "any" ? "" : value
}

function ClearLink({ onClear }: { onClear: () => void }) {
  return (
    <Button type="button" variant="link" size="xs" className="h-auto px-0" onClick={onClear}>
      Limpar
    </Button>
  )
}

function FieldLabel({ label, onClear, hint }: { label: string; onClear?: () => void; hint?: string }) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
        {hint && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger render={<Button type="button" variant="ghost" size="icon-xs" aria-label={hint} />}>
                i
              </TooltipTrigger>
              <TooltipContent>{hint}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      {onClear && <ClearLink onClear={onClear} />}
    </div>
  )
}

function FilterSection({ title, count, children }: { title: string; count: number; children: ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <section className="border-b border-zinc-200 py-3">
      <Button type="button" variant="ghost" size="sm" className="w-full justify-between px-0" onClick={() => setOpen((value) => !value)}>
        <span className="text-xs font-semibold uppercase tracking-wide">{title}</span>
        <span className="flex items-center gap-2 text-zinc-400">
          {count > 0 && <Badge variant="secondary">{count}</Badge>}
          {open ? "–" : "+"}
        </span>
      </Button>
      {open && <div className="mt-3 space-y-3">{children}</div>}
    </section>
  )
}

function StepCombo({
  value,
  placeholder,
  steps,
  onChange,
}: {
  value: number | null
  placeholder: string
  steps: number[]
  onChange: (value: number | null) => void
}) {
  const [text, setText] = useState(value == null ? "" : String(value))
  useEffect(() => {
    setText(value == null ? "" : String(value))
  }, [value])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button type="button" variant="outline" size="sm" className="w-full justify-between font-normal" />}>
        <span className={cn(!value && "text-zinc-400")}>{value == null ? placeholder : formatCompact(value)}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-2">
        <Input
          inputMode="numeric"
          placeholder="Número"
          value={text}
          onChange={(event) => setText(event.target.value.replace(/[^\d]/g, ""))}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              onChange(text ? Number(text) : null)
            }
          }}
          onBlur={() => onChange(text ? Number(text) : null)}
        />
        <div className="mt-1 max-h-48 overflow-y-auto">
          {steps.map((step) => (
            <DropdownMenuItem key={step} onClick={() => onChange(step)}>
              {formatCompact(step)}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function TokenPicker({
  selected,
  options,
  placeholder,
  onChange,
}: {
  selected: string[]
  options: { value: string; count: number }[]
  placeholder: string
  onChange: (next: string[]) => void
}) {
  const [text, setText] = useState("")
  const folded = fold(text.trim())
  const matches = options
    .filter((option) => !selected.includes(option.value) && (!folded || fold(option.value).includes(folded)))
    .slice(0, 6)
  const draft = text.trim()
  const canAdd = draft.length > 0 && !selected.some((item) => fold(item) === fold(draft))

  function add(value: string) {
    onChange([...selected, value])
    setText("")
  }

  return (
    <div className="space-y-1.5">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
              <Button type="button" variant="ghost" size="icon-xs" aria-label={`Remover ${item}`} onClick={() => onChange(selected.filter((entry) => entry !== item))}>
                ×
              </Button>
            </Badge>
          ))}
        </div>
      )}
      <Input value={text} placeholder={placeholder} onChange={(event) => setText(event.target.value)} />
      {(matches.length > 0 || canAdd) && text.trim() && (
        <div className="rounded-lg border border-zinc-200 bg-white p-1">
          {matches.map((option) => (
            <Label key={option.value} className="font-normal">
              <Checkbox checked={false} onCheckedChange={() => add(option.value)} />
              <span className="min-w-0 flex-1 truncate text-sm">{option.value}</span>
              <span className="text-xs text-zinc-400">{option.count.toLocaleString("pt-BR")}</span>
            </Label>
          ))}
          {canAdd && (
            <Button type="button" variant="ghost" size="sm" className="w-full justify-start" onClick={() => add(draft.startsWith("#") || draft.startsWith("@") ? draft : draft)}>
              Adicionar “{draft}”
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

function TextCommit({
  value,
  placeholder,
  onCommit,
}: {
  value: string
  placeholder: string
  onCommit: (value: string) => void
}) {
  const [text, setText] = useState(value)
  useEffect(() => setText(value), [value])
  return (
    <Input
      value={text}
      placeholder={placeholder}
      onChange={(event) => setText(event.target.value)}
      onBlur={() => {
        if (text !== value) onCommit(text.trim())
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault()
          onCommit(text.trim())
        }
      }}
    />
  )
}

export function DiscoverPanel({
  platform,
  creators,
  onPlatform,
}: {
  platform: Platform
  creators: Creator[]
  onPlatform: (platform: Platform) => void
}) {
  const query = useDiscoverStore((state) => state.query)
  const patchQuery = useDiscoverStore((state) => state.patchQuery)
  const replaceQuery = useDiscoverStore((state) => state.replaceQuery)
  const resetQuery = useDiscoverStore((state) => state.resetQuery)
  const savedFilters = useDiscoverStore((state) => state.savedFilters)
  const saveFilter = useDiscoverStore((state) => state.saveFilter)
  const setCampaign = useDiscoverStore((state) => state.setCampaign)
  const organizationId = useAuthStore((state) => state.user?.organizationId)
  const campaigns = useCampaignStore((state) => state.campaigns)
  const presets = useFilterPresetStore((state) => state.presets)
  const [prompt, setPrompt] = useState(query.prompt)
  const [creatorMode, setCreatorMode] = useState(false)
  const [naming, setNaming] = useState(false)
  const [filterName, setFilterName] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)
  const counts = sectionCounts(query)
  const active = isQueryActive(query)

  useEffect(() => {
    setPrompt(query.prompt)
  }, [query.prompt])

  const suggestionQuery = prompt.replace(/^@+/, "").trim()
  const showCreators = creatorMode || prompt.trim().startsWith("@")
  const suggestions = showCreators
    ? creators
        .filter((creator) => {
          const needle = fold(suggestionQuery)
          if (!needle) return true
          return fold(creator.name).includes(needle) || fold(creator.handle).includes(needle) || fold(creator.email).includes(needle)
        })
        .slice(0, 6)
    : []

  function submitPrompt(text: string) {
    if (showCreators && suggestions[0] && text.trim()) {
      chooseCreator(suggestions[0])
      return
    }
    const patch = extractPrompt(text)
    patchQuery({ ...patch, prompt: text.trim() })
    setCreatorMode(false)
  }

  function chooseCreator(creator: Creator) {
    patchQuery({ lookalikeId: creator.id, prompt: "", creatorId: "" })
    setPrompt("")
    setCreatorMode(false)
  }

  function confirmSave() {
    const saved = saveFilter(filterName, platform)
    if (!saved) {
      toast.add({ type: "error", title: "Já existe um filtro com esse nome." })
      return
    }
    toast.add({ type: "success", title: "Filtros salvos", description: saved.name })
    setFilterName("")
    setNaming(false)
  }

  const growthLabel = platform === "youtube" ? "Crescimento de inscritos" : "Crescimento de seguidores"
  const orgCampaigns = campaigns.filter(
    (campaign) => campaign.organizationId === organizationId && campaign.status !== "cancelada" && campaign.status !== "arquivada"
  )
  const orgPresets = presets.filter((preset) => preset.organizationId === organizationId)

  return (
    <div className="flex h-[46vh] w-full shrink-0 flex-col border-b border-zinc-200 bg-zinc-50 lg:h-full lg:w-[340px] lg:border-r lg:border-b-0">
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-4 p-3">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={prompt}
                placeholder={creatorMode ? "@creator ou e-mail" : "ex. lifestyle creator posting fashion and beauty content"}
                onChange={(event) => {
                  const next = event.target.value
                  setPrompt(next)
                  if (next.trim().startsWith("@")) setCreatorMode(true)
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    submitPrompt(prompt)
                  }
                }}
              />
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button type="button" variant="outline" size="icon" aria-label="Mais opções de busca" />}>
                  <Plus />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setCreatorMode(true)}>
                    <UserRound />
                    Modo creator
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => fileRef.current?.click()}>
                    <ImagePlus />
                    Enviar imagem
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  event.target.value = ""
                  if (!file) return
                  const terms = file.name
                    .replace(/\.[^.]+$/, "")
                    .split(/[^\p{L}\p{N}]+/u)
                    .filter((word) => word.length > 2)
                  patchQuery({
                    imageLabel: file.name,
                    imageTerms: terms,
                  })
                }}
              />
            </div>
            {showCreators && (
              <div className="rounded-lg border border-zinc-200 bg-white p-1">
                {suggestions.length === 0 ? (
                  <p className="px-2 py-1.5 text-xs text-zinc-400">Nenhum creator com esse nome.</p>
                ) : (
                  suggestions.map((creator) => {
                    const network = creator.networks[0]
                    return (
                      <Button
                        key={creator.id}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto w-full justify-start py-1.5"
                        onClick={() => chooseCreator(creator)}
                      >
                        <img src={creator.photo} alt="" className="size-7 rounded-full object-cover" />
                        <span className="min-w-0 flex-1 text-left">
                          <span className="block truncate text-sm">{creator.name}</span>
                          <span className="block truncate text-[11px] text-zinc-400">
                            {creator.handle} · {network ? formatCompact(network.followers) : "—"}
                          </span>
                        </span>
                        {network?.network === "instagram" && <SiInstagram className="text-zinc-400" />}
                        {network?.network === "tiktok" && <SiTiktok className="text-zinc-400" />}
                        {network?.network === "youtube" && <SiYoutube className="text-zinc-400" />}
                      </Button>
                    )
                  })
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button type="button" variant="outline" size="sm" className="min-w-0 flex-1 justify-between" />}>
                <span className="truncate">Filtros salvos</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72">
                {savedFilters.length === 0 && orgPresets.length === 0 && (
                  <p className="px-2 py-1.5 text-sm text-zinc-400">Nenhum filtro salvo ainda.</p>
                )}
                {savedFilters.map((filter) => (
                  <DropdownMenuItem
                    key={filter.id}
                    onClick={() => {
                      replaceQuery(filter.query)
                      if (filter.platform !== platform) onPlatform(filter.platform)
                    }}
                  >
                    {filter.name}
                  </DropdownMenuItem>
                ))}
                {orgPresets.map((preset) => (
                  <DropdownMenuItem
                    key={preset.id}
                    onClick={() => {
                      patchQuery(queryFromFilterState(preset.filters))
                      setCampaign(preset.campaignId ?? null)
                      const network = preset.filters.networks.find((item) => isPlatform(item))
                      if (network && network !== platform) onPlatform(network)
                    }}
                  >
                    {preset.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {active && (
              <Button type="button" size="sm" onClick={() => setNaming(true)}>
                <Bookmark />
                Salvar filtros
              </Button>
            )}
          </div>

          <div>
            <FieldLabel label="Redes" />
            <div className="flex flex-wrap gap-3">
              {PLATFORMS.map((network) => {
                const selected = selectedNetworks(query).includes(network)
                const mark = NETWORK_MARK[network]
                return (
                  <Button
                    key={network}
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={mark.label}
                    aria-pressed={selected}
                    className={cn("relative size-11 rounded-full p-0 text-white hover:text-white", mark.className, selected ? "hover:opacity-90" : "opacity-40 hover:opacity-70")}
                    onClick={() => {
                      const current = selectedNetworks(query)
                      if (selected && current.length === 1) return
                      const networks = selected ? current.filter((item) => item !== network) : [...current, network]
                      patchQuery({ networks })
                    }}
                  >
                    <mark.icon className="size-5" />
                    {selected && (
                      <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-zinc-50">
                        <Check className="size-2.5" />
                      </span>
                    )}
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <FieldLabel label="Seguidores de" onClear={query.minFollowers != null ? () => patchQuery({ minFollowers: null }) : undefined} />
              <StepCombo value={query.minFollowers} placeholder="De" steps={FOLLOWER_STEPS} onChange={(minFollowers) => patchQuery({ minFollowers })} />
            </div>
            <div>
              <FieldLabel label="Até" onClear={query.maxFollowers != null ? () => patchQuery({ maxFollowers: null }) : undefined} />
              <StepCombo value={query.maxFollowers} placeholder="Até" steps={FOLLOWER_STEPS} onChange={(maxFollowers) => patchQuery({ maxFollowers })} />
            </div>
          </div>

          <div>
            <FieldLabel
              label="Engajamento"
              onClear={query.minEngagement != null || query.hiddenLikes ? () => patchQuery({ minEngagement: null, hiddenLikes: false }) : undefined}
            />
            <Select
              value={query.hiddenLikes ? "hidden" : query.minEngagement == null ? null : String(query.minEngagement)}
              onValueChange={(value) => {
                if (!value || value === "any") patchQuery({ minEngagement: null, hiddenLikes: false })
                else if (value === "hidden") patchQuery({ hiddenLikes: true, minEngagement: null })
                else patchQuery({ hiddenLikes: false, minEngagement: Number(value) })
              }}
            >
              <SelectTrigger size="sm" className="w-full bg-white">
                <SelectValue placeholder="Qualquer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Qualquer</SelectItem>
                <SelectItem value="hidden">Curtidas ocultas</SelectItem>
                {ENGAGEMENT_STEPS.map((step) => (
                  <SelectItem key={step} value={String(step)}>
                    ≥ {step.toLocaleString("pt-BR")}%
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <FieldLabel label="Views de" hint="Views médios de Reels e vídeos nesta rede." onClear={query.minViews != null ? () => patchQuery({ minViews: null }) : undefined} />
              <StepCombo value={query.minViews} placeholder="De" steps={VIEW_STEPS} onChange={(minViews) => patchQuery({ minViews })} />
            </div>
            <div>
              <FieldLabel label="Até" onClear={query.maxViews != null ? () => patchQuery({ maxViews: null }) : undefined} />
              <StepCombo value={query.maxViews} placeholder="Até" steps={VIEW_STEPS} onChange={(maxViews) => patchQuery({ maxViews })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <FieldLabel label={growthLabel} onClear={query.minGrowth != null ? () => patchQuery({ minGrowth: null }) : undefined} />
              <Select
                value={query.minGrowth == null ? null : String(query.minGrowth)}
                onValueChange={(value) => patchQuery({ minGrowth: !value || value === "any" ? null : Number(value) })}
              >
                <SelectTrigger size="sm" className="w-full bg-white">
                  <SelectValue placeholder="Crescimento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer</SelectItem>
                  {GROWTH_STEPS.map((step) => (
                    <SelectItem key={step} value={String(step)}>
                      {step}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel label="Período" onClear={query.growthMonths != null ? () => patchQuery({ growthMonths: null }) : undefined} />
              <Select
                value={query.growthMonths == null ? null : String(query.growthMonths)}
                onValueChange={(value) => patchQuery({ growthMonths: !value || value === "any" ? null : Number(value) })}
              >
                <SelectTrigger size="sm" className="w-full bg-white">
                  <SelectValue placeholder="Meses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer</SelectItem>
                  {[1, 2, 3, 4, 5, 6].map((month) => (
                    <SelectItem key={month} value={String(month)}>
                      {month} {month === 1 ? "mês" : "meses"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <FieldLabel label="Localização" onClear={query.locations ? () => patchQuery({ locations: "" }) : undefined} />
            <LocationField value={query.locations} placeholder="País, estado ou cidade" onChange={(locations) => patchQuery({ locations })} />
          </div>

          <div>
            <FieldLabel label="Marcas" onClear={query.brands.length ? () => patchQuery({ brands: [] }) : undefined} />
            <TokenPicker
              selected={query.brands}
              options={brandIndex()}
              placeholder="Comece a digitar uma marca"
              onChange={(brands) => patchQuery({ brands })}
            />
          </div>

          <FilterSection title="Creator" count={counts.creator}>
            <div>
              <FieldLabel label="Creator" onClear={query.creatorId ? () => patchQuery({ creatorId: "" }) : undefined} />
              <Select value={query.creatorId || null} onValueChange={(value) => patchQuery({ creatorId: value ?? "" })}>
                <SelectTrigger size="sm" className="w-full bg-white">
                  <SelectValue placeholder="@creator ou e-mail">
                    {(value) => creators.find((creator) => creator.id === value)?.handle ?? "@creator ou e-mail"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {creators.map((creator) => (
                    <SelectItem key={creator.id} value={creator.id}>
                      {creator.name} · {creator.handle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel label="Bio contém" onClear={query.bioInclude ? () => patchQuery({ bioInclude: "" }) : undefined} />
              <TextCommit value={query.bioInclude} placeholder="Incluir qualquer termo" onCommit={(bioInclude) => patchQuery({ bioInclude })} />
            </div>
            <div>
              <FieldLabel label="Bio não contém" onClear={query.bioExclude ? () => patchQuery({ bioExclude: "" }) : undefined} />
              <TextCommit value={query.bioExclude} placeholder="Não incluir" onCommit={(bioExclude) => patchQuery({ bioExclude })} />
            </div>
            <div>
              <FieldLabel label="Gênero" onClear={query.gender ? () => patchQuery({ gender: "" }) : undefined} />
              <Select value={query.gender || null} onValueChange={(value) => patchQuery({ gender: choice(value) as GenderFilter | "" })}>
                <SelectTrigger size="sm" className="w-full bg-white">
                  <SelectValue placeholder="Qualquer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer</SelectItem>
                  {(Object.keys(GENDER_LABEL) as GenderFilter[]).map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {GENDER_LABEL[gender]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <FieldLabel label="Idade de" onClear={query.minAge != null ? () => patchQuery({ minAge: null }) : undefined} />
                <Select value={query.minAge == null ? null : String(query.minAge)} onValueChange={(value) => patchQuery({ minAge: !value || value === "any" ? null : Number(value) })}>
                  <SelectTrigger size="sm" className="w-full bg-white">
                    <SelectValue placeholder="De" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Qualquer</SelectItem>
                    {AGE_STEPS.map((age) => (
                      <SelectItem key={age} value={String(age)}>
                        {age}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel label="Até" onClear={query.maxAge != null ? () => patchQuery({ maxAge: null }) : undefined} />
                <Select value={query.maxAge == null ? null : String(query.maxAge)} onValueChange={(value) => patchQuery({ maxAge: !value || value === "any" ? null : Number(value) })}>
                  <SelectTrigger size="sm" className="w-full bg-white">
                    <SelectValue placeholder="Até" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Qualquer</SelectItem>
                    {AGE_STEPS.map((age) => (
                      <SelectItem key={age} value={String(age)}>
                        {age}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <FieldLabel label="Idioma" onClear={query.language ? () => patchQuery({ language: "" }) : undefined} />
              <Select value={query.language || null} onValueChange={(value) => patchQuery({ language: !value || value === "any" ? "" : value })}>
                <SelectTrigger size="sm" className="w-full bg-white">
                  <SelectValue placeholder="Qualquer idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer</SelectItem>
                  {LANGUAGES.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FieldLabel label="Audiência" onClear={query.audienceLocations ? () => patchQuery({ audienceLocations: "" }) : undefined} />
              <LocationField
                value={query.audienceLocations}
                placeholder="Cidade predominante da audiência"
                onChange={(audienceLocations) => patchQuery({ audienceLocations })}
              />
            </div>
            <Label className="font-normal">
              <Checkbox checked={query.emailAvailable} onCheckedChange={(checked) => patchQuery({ emailAvailable: checked === true })} />
              E-mail disponível
            </Label>
          </FilterSection>

          <FilterSection title="Atividade" count={counts.activity}>
            <Label className="font-normal">
              <Checkbox checked={query.activeOnly} onCheckedChange={(checked) => patchQuery({ activeOnly: checked === true })} />
              Só creators ativos
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <FieldLabel label="Frequência de" onClear={query.minPosting ? () => patchQuery({ minPosting: "" }) : undefined} />
                <Select value={query.minPosting || null} onValueChange={(value) => patchQuery({ minPosting: choice(value) as PostingFrequency | "" })}>
                  <SelectTrigger size="sm" className="w-full bg-white">
                    <SelectValue placeholder="De" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Qualquer</SelectItem>
                    {(Object.keys(FREQUENCY_LABEL) as PostingFrequency[]).map((frequency) => (
                      <SelectItem key={frequency} value={frequency}>
                        {FREQUENCY_LABEL[frequency]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel label="Até" onClear={query.maxPosting ? () => patchQuery({ maxPosting: "" }) : undefined} />
                <Select value={query.maxPosting || null} onValueChange={(value) => patchQuery({ maxPosting: choice(value) as PostingFrequency | "" })}>
                  <SelectTrigger size="sm" className="w-full bg-white">
                    <SelectValue placeholder="Até" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Qualquer</SelectItem>
                    {(Object.keys(FREQUENCY_LABEL) as PostingFrequency[]).map((frequency) => (
                      <SelectItem key={frequency} value={frequency}>
                        {FREQUENCY_LABEL[frequency]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <FieldLabel
                label="Publicou em"
                onClear={query.postedWithinMonths != null ? () => patchQuery({ postedWithinMonths: null }) : undefined}
              />
              <Select
                value={query.postedWithinMonths == null ? null : String(query.postedWithinMonths)}
                disabled={!postedWithinEnabled(query)}
                onValueChange={(value) => patchQuery({ postedWithinMonths: !value || value === "any" ? null : Number(value) })}
              >
                <SelectTrigger size="sm" className="w-full bg-white">
                  <SelectValue placeholder={postedWithinEnabled(query) ? "Qualquer" : "Adicione uma busca, hashtag, menção, legenda ou áudio"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer</SelectItem>
                  {POSTED_WITHIN.map((months) => (
                    <SelectItem key={months} value={String(months)}>
                      {months} meses
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FilterSection>

          <FilterSection title="Conteúdo" count={counts.content}>
            <div>
              <FieldLabel label="Temas" onClear={query.niches.length ? () => patchQuery({ niches: [] }) : undefined} />
              <div className="flex flex-wrap gap-1.5">
                {NICHES.map((niche) => {
                  const selected = query.niches.includes(niche)
                  return (
                    <Button
                      key={niche}
                      type="button"
                      size="xs"
                      variant={selected ? "default" : "outline"}
                      className="capitalize"
                      onClick={() =>
                        patchQuery({
                          niches: selected ? query.niches.filter((item) => item !== niche) : [...query.niches, niche],
                        })
                      }
                    >
                      {niche}
                    </Button>
                  )
                })}
              </div>
            </div>
            <div>
              <FieldLabel label="Legenda contém" onClear={query.captionsInclude ? () => patchQuery({ captionsInclude: "" }) : undefined} />
              <TextCommit value={query.captionsInclude} placeholder="Incluir" onCommit={(captionsInclude) => patchQuery({ captionsInclude })} />
            </div>
            <div>
              <FieldLabel label="Legenda não contém" onClear={query.captionsExclude ? () => patchQuery({ captionsExclude: "" }) : undefined} />
              <TextCommit value={query.captionsExclude} placeholder="Não incluir" onCommit={(captionsExclude) => patchQuery({ captionsExclude })} />
            </div>
            <div>
              <FieldLabel label="Hashtags" onClear={query.hashtagsInclude.length ? () => patchQuery({ hashtagsInclude: [] }) : undefined} />
              <TokenPicker selected={query.hashtagsInclude} options={hashtagIndex()} placeholder="#hashtag" onChange={(hashtagsInclude) => patchQuery({ hashtagsInclude })} />
            </div>
            <div>
              <FieldLabel label="Hashtags excluídas" onClear={query.hashtagsExclude.length ? () => patchQuery({ hashtagsExclude: [] }) : undefined} />
              <TokenPicker selected={query.hashtagsExclude} options={hashtagIndex()} placeholder="Não incluir" onChange={(hashtagsExclude) => patchQuery({ hashtagsExclude })} />
            </div>
            <div>
              <FieldLabel label="Menções" onClear={query.mentionsInclude.length ? () => patchQuery({ mentionsInclude: [] }) : undefined} />
              <TokenPicker selected={query.mentionsInclude} options={mentionIndex()} placeholder="@marca" onChange={(mentionsInclude) => patchQuery({ mentionsInclude })} />
            </div>
            <div>
              <FieldLabel label="Menções excluídas" onClear={query.mentionsExclude.length ? () => patchQuery({ mentionsExclude: [] }) : undefined} />
              <TokenPicker selected={query.mentionsExclude} options={mentionIndex()} placeholder="Não incluir" onChange={(mentionsExclude) => patchQuery({ mentionsExclude })} />
            </div>
            <div>
              <FieldLabel label="Áudio" onClear={query.audios.length ? () => patchQuery({ audios: [] }) : undefined} />
              <TokenPicker selected={query.audios} options={[]} placeholder="Música ou artista" onChange={(audios) => patchQuery({ audios })} />
            </div>
          </FilterSection>

          <FilterSection title="Outros" count={counts.other}>
            <div>
              <FieldLabel label="Seguidores falsos" onClear={query.maxFakeFollowers != null ? () => patchQuery({ maxFakeFollowers: null }) : undefined} />
              <Select
                value={query.maxFakeFollowers == null ? null : String(query.maxFakeFollowers)}
                onValueChange={(value) => patchQuery({ maxFakeFollowers: !value || value === "any" ? null : Number(value) })}
              >
                <SelectTrigger size="sm" className="w-full bg-white">
                  <SelectValue placeholder="Qualquer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer</SelectItem>
                  {FAKE_STEPS.map((step) => (
                    <SelectItem key={step} value={String(step)}>
                      ≤ {step}%
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <FieldLabel label="Tipo de conta" onClear={query.accountTypes.length ? () => patchQuery({ accountTypes: [] }) : undefined} />
              {(Object.keys(ACCOUNT_TYPE_LABEL) as AccountType[]).map((type) => (
                <Label key={type} className="font-normal">
                  <Checkbox
                    checked={query.accountTypes.includes(type)}
                    onCheckedChange={(checked) => {
                      const accountTypes = checked === true
                        ? [...query.accountTypes, type]
                        : query.accountTypes.filter((item) => item !== type)
                      patchQuery({ accountTypes })
                    }}
                  />
                  {ACCOUNT_TYPE_LABEL[type]}
                </Label>
              ))}
            </div>
            <Label className="font-normal">
              <Checkbox checked={query.availableOnly} onCheckedChange={(checked) => patchQuery({ availableOnly: checked === true })} />
              Disponíveis para parceria
            </Label>
            <Label className="font-normal">
              <Checkbox checked={query.brandCustomers} onCheckedChange={(checked) => patchQuery({ brandCustomers: checked === true })} />
              Clientes da marca
            </Label>
            <Label className="font-normal">
              <Checkbox checked={query.ownBase} onCheckedChange={(checked) => patchQuery({ ownBase: checked === true })} />
              Base própria
            </Label>
            <Label className="font-normal">
              <Checkbox checked={query.verifiedOnly} onCheckedChange={(checked) => patchQuery({ verifiedOnly: checked === true })} />
              Só creators verificados
            </Label>
            <Label className="font-normal">
              <Checkbox checked={query.hideSaved} onCheckedChange={(checked) => patchQuery({ hideSaved: checked === true })} />
              Ocultar perfis salvos
            </Label>
            <div>
              <FieldLabel label="Último post" onClear={query.lastPostedDays != null ? () => patchQuery({ lastPostedDays: null }) : undefined} />
              <Select
                value={query.lastPostedDays == null ? null : String(query.lastPostedDays)}
                onValueChange={(value) => patchQuery({ lastPostedDays: !value || value === "any" ? null : Number(value) })}
              >
                <SelectTrigger size="sm" className="w-full bg-white">
                  <SelectValue placeholder="Qualquer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Qualquer</SelectItem>
                  {[30, 60, 90].map((days) => (
                    <SelectItem key={days} value={String(days)}>
                      {days} dias
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FilterSection>

          {orgCampaigns.length > 0 && (
            <div className="space-y-2 pb-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Campanhas</p>
              {orgCampaigns.map((campaign) => (
                <Button
                  key={campaign.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-auto w-full justify-start whitespace-normal py-2 text-left"
                  onClick={() => {
                    setCampaign(campaign.id)
                    patchQuery({
                      niches: [...campaign.targetNiches],
                      minFollowers: campaign.minFollowers > 0 ? campaign.minFollowers : null,
                      maxFollowers: campaign.maxFollowers > 0 ? campaign.maxFollowers : null,
                      minEngagement: campaign.minEngagement > 0 ? campaign.minEngagement : null,
                    })
                    const network = campaign.targetNetworks.find((item) => isPlatform(item))
                    if (network) onPlatform(network)
                  }}
                >
                  {campaign.name}
                </Button>
              ))}
            </div>
          )}

          {active && (
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => resetQuery()}>
              Limpar filtros
            </Button>
          )}
        </div>
      </ScrollArea>

      <Dialog open={naming} onOpenChange={setNaming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar filtros</DialogTitle>
            <DialogDescription>O nome fica nesta conta e restaura a busca ao ser escolhido.</DialogDescription>
          </DialogHeader>
          <Input
            value={filterName}
            placeholder="Ex.: Beleza em São Paulo"
            onChange={(event) => setFilterName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                confirmSave()
              }
            }}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setNaming(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={!filterName.trim()} onClick={confirmSave}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export type { DiscoverQuery }
