"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { BadgeCheck, Coins, Loader2, RefreshCw, Search } from "lucide-react"
import { TopBar } from "@/components/layout/top-bar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useApi } from "@/lib/api/use-api"
import {
  AGE_BUCKETS,
  PERIODS,
  SL,
  describeError,
  formatDateTime,
  formatNumber,
  type AgeBucket,
  type CreatorFilters,
  type CreatorInsights,
  type CreatorSummary,
  type InstagramConnection,
  type InsightsPeriod,
  type ProfileResponse,
  type SearchResponse,
  type Share,
} from "@/lib/meta-discovery/api"

type Err = { code: string; detail: string } | null

const FOLLOWER_TIERS = [0, 2000, 10000, 50000, 100000, 500000, 1000000]

interface Form {
  text: string
  countries: string
  states: string
  minFollowers: string
  maxFollowers: string
  interests: string
  gender: string
  ageBucket: string
  audienceCountries: string
  audienceAgeBucket: string
  audienceGender: string
  verifiedOnly: boolean
}

const EMPTY: Form = {
  text: "",
  countries: "BR",
  states: "",
  minFollowers: "",
  maxFollowers: "",
  interests: "",
  gender: "",
  ageBucket: "",
  audienceCountries: "",
  audienceAgeBucket: "",
  audienceGender: "",
  verifiedOnly: false,
}

const list = (s: string) =>
  s
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)

function toFilters(f: Form): CreatorFilters {
  const out: CreatorFilters = {}
  if (f.text.trim()) out.text = f.text.trim()
  if (list(f.countries).length) out.countries = list(f.countries).map((c) => c.toUpperCase())
  if (list(f.states).length) out.states = list(f.states)
  if (f.minFollowers) out.minFollowers = Number(f.minFollowers)
  if (f.maxFollowers) out.maxFollowers = Number(f.maxFollowers)
  if (list(f.interests).length) out.interests = list(f.interests).map((i) => i.toUpperCase())
  if (f.gender) out.gender = f.gender
  if (f.ageBucket) out.ageBucket = f.ageBucket as AgeBucket
  if (list(f.audienceCountries).length) out.audienceCountries = list(f.audienceCountries).map((c) => c.toUpperCase())
  if (f.audienceAgeBucket) out.audienceAgeBucket = f.audienceAgeBucket as AgeBucket
  if (f.audienceGender) out.audienceGender = f.audienceGender
  if (f.verifiedOnly) out.verifiedOnly = true
  return out
}

const selectClass = "h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"

// Spike: real search on Meta's Creator Marketplace through social-listening.
// Every page, profile and period change is a paid action (coins).
export function MetaDiscoveryScreen() {
  const { signedIn, marcaId, request } = useApi()
  const [conn, setConn] = useState<InstagramConnection | null>(null)
  const [connErr, setConnErr] = useState<Err>(null)
  const [form, setForm] = useState<Form>(EMPTY)
  const [sent, setSent] = useState<CreatorFilters | null>(null)
  const [pages, setPages] = useState<SearchResponse[]>([])
  const [searching, setSearching] = useState(false)
  const [err, setErr] = useState<Err>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [open, setOpen] = useState<CreatorSummary | null>(null)

  useEffect(() => {
    if (!signedIn || !marcaId) return
    request<InstagramConnection>("GET", `${SL}/instagram/connection`).then(
      (c) => {
        setConn(c)
        setConnErr(null)
      },
      (e) => setConnErr(describeError(e))
    )
  }, [signedIn, marcaId, request])

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }))

  const run = async (filters: CreatorFilters, cursor?: string) => {
    setSearching(true)
    setErr(null)
    try {
      const page = await request<SearchResponse>("POST", `${SL}/creators/search`, cursor ? { filters, cursor } : { filters })
      setPages((prev) => (cursor ? [...prev, page] : [page]))
      setBalance(page.coinBalance)
      setSent(filters)
    } catch (e) {
      setErr(describeError(e))
    } finally {
      setSearching(false)
    }
  }

  const creators = pages.flatMap((p) => p.creators)
  const last = pages.at(-1)
  const blocked = !signedIn
    ? "Entre com conta real (Clerk) para usar a busca real."
    : !marcaId
      ? "Defina a Marca ativa em Configurações → Integrações."
      : null

  return (
    <div className="flex min-h-screen flex-1 flex-col">
      <TopBar title="Descoberta · Meta (real)" subtitle="Creator Marketplace via social-listening" />
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 bg-white px-6 py-2 text-xs text-zinc-600">
        {conn ? (
          <>
            <span>Instagram: {conn.username ? `@${conn.username}` : "não conectado"}</span>
            <Badge variant={conn.discovery.status === "available" ? "secondary" : "destructive"}>
              discovery: {conn.discovery.status}
            </Badge>
          </>
        ) : (
          <span>{blocked ?? (connErr ? `${connErr.code}: ${connErr.detail}` : "Carregando conexão…")}</span>
        )}
        {balance !== null && (
          <span className="ml-auto flex items-center gap-1 font-medium text-zinc-900">
            <Coins size={14} /> {balance} coins
          </span>
        )}
        <Link href="/settings" className="underline">
          Integrações
        </Link>
        <Link href="/discovery/instagram" className="underline">
          Busca mock
        </Link>
      </div>
      {conn?.discovery.instruction && (
        <p className="border-b border-amber-200 bg-amber-50 px-6 py-2 text-xs text-amber-800">{conn.discovery.instruction}</p>
      )}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <form
          className="w-full shrink-0 space-y-3 border-b border-zinc-200 bg-white p-4 lg:w-[320px] lg:border-r lg:border-b-0"
          onSubmit={(e) => {
            e.preventDefault()
            void run(toFilters(form))
          }}
        >
          <Field label="Texto livre">
            <Input value={form.text} onChange={(e) => set("text", e.target.value)} placeholder="moda, skincare…" />
          </Field>
          <Field label="Países do creator (ISO, vírgula)">
            <Input value={form.countries} onChange={(e) => set("countries", e.target.value)} placeholder="BR,PT" />
          </Field>
          <Field label="Estados (exige 1 país)">
            <Input value={form.states} onChange={(e) => set("states", e.target.value)} placeholder="São Paulo" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Seguidores mín.">
              <select className={selectClass} value={form.minFollowers} onChange={(e) => set("minFollowers", e.target.value)}>
                <option value="">—</option>
                {FOLLOWER_TIERS.map((n) => (
                  <option key={n} value={n}>
                    {formatNumber(n)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Seguidores máx.">
              <select className={selectClass} value={form.maxFollowers} onChange={(e) => set("maxFollowers", e.target.value)}>
                <option value="">—</option>
                {FOLLOWER_TIERS.slice(1).map((n) => (
                  <option key={n} value={n}>
                    {formatNumber(n)}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Interesses (até 5, vírgula)">
            <Input value={form.interests} onChange={(e) => set("interests", e.target.value)} placeholder="BEAUTY,FASHION" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Gênero">
              <Input value={form.gender} onChange={(e) => set("gender", e.target.value)} placeholder="female" />
            </Field>
            <Field label="Idade">
              <AgeSelect value={form.ageBucket} onChange={(v) => set("ageBucket", v)} />
            </Field>
          </div>
          <p className="pt-1 text-xs font-medium text-zinc-500">Audiência</p>
          <Field label="Países da audiência">
            <Input value={form.audienceCountries} onChange={(e) => set("audienceCountries", e.target.value)} placeholder="BR" />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Gênero">
              <Input value={form.audienceGender} onChange={(e) => set("audienceGender", e.target.value)} placeholder="female" />
            </Field>
            <Field label="Idade">
              <AgeSelect value={form.audienceAgeBucket} onChange={(v) => set("audienceAgeBucket", v)} />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input type="checkbox" checked={form.verifiedOnly} onChange={(e) => set("verifiedOnly", e.target.checked)} />
            Só verificados
          </label>
          <div className="flex gap-2 pt-1">
            <Button type="submit" className="flex-1" disabled={!!blocked || searching}>
              {searching ? <Loader2 className="animate-spin" /> : <Search />}
              Buscar (cobra coins)
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm(EMPTY)
                setPages([])
                setSent(null)
                setErr(null)
              }}
            >
              Limpar
            </Button>
          </div>
        </form>

        <div className="min-w-0 flex-1 space-y-3 p-4">
          {err && <ErrorBox err={err} />}
          {last && (
            <p className="text-xs text-zinc-500">
              {creators.length} creators em {pages.length} página(s) · última página gerada pela Meta em{" "}
              {formatDateTime(last.fetchedAt)}
            </p>
          )}
          {!pages.length && !err && !searching && (
            <p className="text-sm text-zinc-500">Preencha os filtros e busque. Cada página entregue cobra coins, mesmo do cache.</p>
          )}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {creators.map((c) => (
              <Card key={`${c.id}-${c.username}`} className="cursor-pointer p-4 transition-colors hover:bg-zinc-50" onClick={() => setOpen(c)}>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.pictureUrl} alt="" className="size-12 shrink-0 rounded-full bg-zinc-200 object-cover" />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 truncate text-sm font-semibold text-zinc-900">
                      @{c.username} {c.verified && <BadgeCheck size={14} className="text-sky-500" />}
                    </p>
                    <p className="truncate text-xs text-zinc-500">
                      {formatNumber(c.followers)} seguidores · {c.country || "—"} · {c.category || "—"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  <Badge variant={c.onboarded ? "secondary" : "outline"}>{c.onboarded ? "No Marketplace" : "Fora do Marketplace"}</Badge>
                  {c.badges.map((b) => (
                    <Badge key={b} variant="outline">
                      {b}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
          {last?.nextCursor && sent && (
            <Button variant="outline" disabled={searching} onClick={() => run(sent, last.nextCursor)}>
              {searching ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              Próxima página (cobra coins)
            </Button>
          )}
        </div>
      </div>

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {open && <CreatorPanel key={open.username} summary={open} onBalance={setBalance} />}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function CreatorPanel({ summary, onBalance }: { summary: CreatorSummary; onBalance: (n: number) => void }) {
  const { request } = useApi()
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [insights, setInsights] = useState<{ data: CreatorInsights; fetchedAt: string } | null>(null)
  const [err, setErr] = useState<Err>(null)
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const openProfile = async () => {
    setLoading(true)
    setErr(null)
    try {
      const res = await request<ProfileResponse>("GET", `${SL}/creators/${encodeURIComponent(summary.username)}`)
      setProfile(res)
      setInsights({ data: res.insights, fetchedAt: res.fetchedAt })
      onBalance(res.coinBalance)
      setLoaded(true)
    } catch (e) {
      setErr(describeError(e))
    } finally {
      setLoading(false)
    }
  }

  const changePeriod = async (period: InsightsPeriod) => {
    setLoading(true)
    setErr(null)
    try {
      const res = await request<{ insights: CreatorInsights; fetchedAt: string; coinBalance: number }>(
        "GET",
        `${SL}/creators/${encodeURIComponent(summary.username)}/insights?period=${period}`
      )
      setInsights({ data: res.insights, fetchedAt: res.fetchedAt })
      onBalance(res.coinBalance)
    } catch (e) {
      setErr(describeError(e))
    } finally {
      setLoading(false)
    }
  }

  const p = profile?.creator

  return (
    <div className="space-y-4 p-4">
      <SheetHeader className="p-0">
        <SheetTitle className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={summary.pictureUrl} alt="" className="size-12 rounded-full bg-zinc-200 object-cover" />
          <span>
            @{summary.username}
            <span className="block text-xs font-normal text-zinc-500">
              {formatNumber(summary.followers)} seguidores · {summary.category || "—"}
            </span>
          </span>
        </SheetTitle>
      </SheetHeader>

      {!loaded && (
        <Button onClick={openProfile} disabled={loading}>
          {loading && <Loader2 className="animate-spin" />}
          Abrir perfil com insights (cobra coins)
        </Button>
      )}
      {err && <ErrorBox err={err} />}

      {p && (
        <>
          {p.bio && <p className="text-sm whitespace-pre-line text-zinc-700">{p.bio}</p>}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Stat label="Engajamento (Reels 90d)" value={`${(p.engagementRate * 100).toFixed(2)}%`} />
            <Stat label="Hook rate (Reels 90d)" value={`${(p.reelsHookRate * 100).toFixed(2)}%`} />
            {p.gender && <Stat label="Gênero" value={p.gender} />}
            {p.ageBucket && <Stat label="Idade" value={p.ageBucket} />}
            {p.email && <Stat label="E-mail" value={p.email} />}
            {p.portfolioUrl && (
              <Stat
                label="Portfólio"
                value={
                  <a href={p.portfolioUrl} target="_blank" rel="noreferrer" className="underline">
                    abrir
                  </a>
                }
              />
            )}
          </div>
          {p.hasPartnerships && (
            <p className="text-xs text-zinc-600">
              Parcerias anteriores: {p.partnerBrands.length ? p.partnerBrands.join(", ") : "sim"}
            </p>
          )}
        </>
      )}

      {insights && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-1">
            {PERIODS.map((period) => (
              <Button
                key={period.id}
                size="sm"
                variant={insights.data.period === period.id ? "default" : "outline"}
                disabled={loading || insights.data.period === period.id}
                onClick={() => changePeriod(period.id)}
              >
                {period.label}
              </Button>
            ))}
            {loading && <Loader2 size={14} className="animate-spin text-zinc-400" />}
          </div>
          <p className="text-xs text-zinc-500">
            Trocar período cobra coins · dados gerados pela Meta em {formatDateTime(insights.fetchedAt)}
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Stat label="Contas engajadas" value={formatNumber(insights.data.engagedAccounts)} />
            <Stat label="Alcance" value={formatNumber(insights.data.reach)} />
            <Stat label="Visualizações" value={formatNumber(insights.data.views)} />
            <Stat label="Interações" value={formatNumber(insights.data.interactions)} />
          </div>
          <Shares title="Idade" shares={insights.data.engagedByAge} />
          <Shares title="Gênero" shares={insights.data.engagedByGender} />
          <Shares title="Países" shares={insights.data.engagedByCountry} />
          <Shares title="Cidades" shares={insights.data.engagedByCity} />
        </section>
      )}

      {p && (p.recentMedia.length > 0 || p.brandedContent.length > 0) && (
        <section className="space-y-2">
          <Media title="Posts recentes" items={p.recentMedia} />
          <Media title="Conteúdo de marca" items={p.brandedContent} />
        </section>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-zinc-500">{label}</span>
      {children}
    </label>
  )
}

function AgeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select className={selectClass} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">—</option>
      {AGE_BUCKETS.map((b) => (
        <option key={b} value={b}>
          {b}
        </option>
      ))}
    </select>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-2">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="truncate font-medium text-zinc-900">{value}</p>
    </div>
  )
}

function Shares({ title, shares }: { title: string; shares: Share[] }) {
  if (!shares.length) return null
  const total = shares.reduce((sum, s) => sum + s.accounts, 0) || 1
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-zinc-600">{title}</p>
      <div className="space-y-1">
        {shares.slice(0, 8).map((s) => (
          <div key={s.key} className="flex items-center gap-2 text-xs">
            <span className="w-24 shrink-0 truncate text-zinc-600">{s.key}</span>
            <span className="h-2 flex-1 overflow-hidden rounded bg-zinc-100">
              <span className="block h-full bg-zinc-800" style={{ width: `${(s.accounts / total) * 100}%` }} />
            </span>
            <span className="w-12 shrink-0 text-right text-zinc-500">{Math.round((s.accounts / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function Media({ title, items }: { title: string; items: { id: string; permalink: string; thumbnailUrl?: string }[] }) {
  if (!items.length) return null
  return (
    <div>
      <p className="mb-1 text-xs font-medium text-zinc-600">{title}</p>
      <div className="grid grid-cols-4 gap-1">
        {items.map((m) => (
          <a key={m.id} href={m.permalink} target="_blank" rel="noreferrer" className="block aspect-square overflow-hidden rounded bg-zinc-100">
            {m.thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.thumbnailUrl} alt="" className="size-full object-cover" />
            )}
          </a>
        ))}
      </div>
    </div>
  )
}

function ErrorBox({ err }: { err: NonNullable<Err> }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <span className="font-mono text-xs">{err.code}</span>
      <p>{err.detail}</p>
    </div>
  )
}
