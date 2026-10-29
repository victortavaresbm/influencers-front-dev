"use client"
import { useState } from "react"
import { TopBar } from "@/components/layout/top-bar"
import { useAuthStore } from "@/lib/stores/auth"
import { CREATORS, type Network } from "@/lib/mock-data/creators"
import { toast } from "@/components/ui/toast"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiInstagram, SiTiktok, SiYoutube } from "react-icons/si"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { useI18n } from "@/lib/i18n"
import { Star, MapPin, Edit, Shield } from "lucide-react"

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`
  return n.toString()
}

const TIER_LABELS: Record<string, string> = { nano: "Nano", micro: "Micro", mid: "Mid", macro: "Macro", mega: "Mega" }

const NETWORK_ORDER: Network[] = ["instagram", "youtube", "tiktok"]

const NETWORK_LABEL: Record<Network, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
}

const NetworkIcon = ({ network }: { network: string }) => {
  if (network === "instagram") return <SiInstagram size={14} />
  if (network === "tiktok") return <SiTiktok size={14} />
  if (network === "youtube") return <SiYoutube size={14} />
  return null
}

export default function CreatorProfilePage() {
  const { t } = useI18n()
  const user = useAuthStore((s) => s.user)
  const creator = CREATORS.find((c) => c.email === user?.email) ?? CREATORS[0]
  const [linked, setLinked] = useState<Network[]>([])
  const missing = NETWORK_ORDER.filter(
    (id) => !creator.networks.some((n) => n.network === id) && !linked.includes(id)
  )

  const connectNetwork = (id: Network) => {
    setLinked((current) => (current.includes(id) ? current : [...current, id]))
    toast.add({
      type: "success",
      title: `${NETWORK_LABEL[id]} conectado`,
      description: "Seus pontos passam a considerar essa rede.",
    })
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar
        title={t("pages.myProfile")}
        subtitle={t("pages.howBrandsSeeYou")}
        actions={
          <Button size="sm" variant="outline" className="gap-2">
            <Edit size={14} /> Editar perfil
          </Button>
        }
      />

      <div className="p-6 max-w-4xl mx-auto w-full space-y-4">
        {/* Profile header */}
        <Card className="p-6">
          <div className="flex items-start gap-5">
            <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {creator.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <h2 className="text-lg font-semibold text-zinc-900">{creator.name}</h2>
                <span className="text-zinc-400 text-sm">{creator.handle}</span>
                <Badge variant="outline" className="text-xs capitalize">{TIER_LABELS[creator.tier]}</Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-zinc-500 mb-2">
                <MapPin size={11} />
                {creator.location}
              </div>
              <p className="text-sm text-zinc-600">{creator.bio}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {creator.niche.map((n) => (
                  <Badge key={n} variant="outline" className="text-xs capitalize">{n}</Badge>
                ))}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end mb-1">
                <Star size={14} className="text-zinc-700 fill-zinc-700" />
                <span className="text-lg font-bold text-zinc-900">{creator.score}</span>
                <span className="text-sm text-zinc-400">/100</span>
              </div>
              <p className="text-xs text-zinc-400">Score de creator</p>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="stats">
          <TabsList>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            <TabsTrigger value="networks">Redes conectadas</TabsTrigger>
            <TabsTrigger value="audience">Audiência</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: "Total seguidores", value: fmt(creator.totalFollowers) },
                { label: "Engajamento médio", value: `${creator.avgEngagement.toFixed(1)}%` },
                { label: "Campanhas realizadas", value: creator.pastCampaigns },
                { label: "Valor de mídia", value: `R$ ${creator.mediaValue.toLocaleString("pt-BR")}` },
              ].map(({ label, value }) => (
                <Card key={label} className="p-4 text-center">
                  <p className="text-xl font-semibold text-zinc-900">{value}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{label}</p>
                </Card>
              ))}
            </div>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield size={14} className="text-zinc-600" />
                <h3 className="text-sm font-semibold text-zinc-900">Score de autenticidade</h3>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={100 - creator.fraudScore * 10} className="h-2 flex-1" />
                <span className={`text-sm font-medium ${creator.fraudScore <= 2 ? "text-green-600" : creator.fraudScore <= 4 ? "text-yellow-600" : "text-red-600"}`}>
                  {creator.fraudScore <= 2 ? "Excelente" : creator.fraudScore <= 4 ? "Bom" : "Atenção"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                Risco de fraude: {creator.fraudScore}/10 — Quanto menor, melhor.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="networks" className="mt-4 space-y-3">
            {missing.length > 0 && (
              <Card className="p-4">
                <p className="text-sm font-semibold text-zinc-900">Conecte suas redes</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Melhore suas chances de se conectar com as marcas conectando suas redes sociais. Seus pontos aumentam.
                </p>
              </Card>
            )}
            {NETWORK_ORDER.map((id) => {
              const connected = creator.networks.find((n) => n.network === id)
              if (!connected) {
                const pendingSync = linked.includes(id)
                return (
                  <Card key={id} className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
                          <NetworkIcon network={id} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">{NETWORK_LABEL[id]}</p>
                          <p className="text-xs text-zinc-400">
                            {pendingSync ? "Sincronizando dados" : "Não conectado"}
                          </p>
                        </div>
                      </div>
                      {pendingSync ? (
                        <Badge variant="outline" className="text-xs text-green-700 border-green-200">Conectado</Badge>
                      ) : (
                        <Button size="sm" onClick={() => connectNetwork(id)}>
                          Conectar {NETWORK_LABEL[id]}
                        </Button>
                      )}
                    </div>
                  </Card>
                )
              }

              return (
                <Card key={id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
                        <NetworkIcon network={id} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{NETWORK_LABEL[id]}</p>
                        <p className="text-xs text-zinc-400">{connected.handle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {connected.verified && <VerifiedBadge className="size-4" />}
                      <Badge variant="outline" className="text-xs text-green-700 border-green-200">Conectado</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-base font-semibold text-zinc-900">{fmt(connected.followers)}</p>
                      <p className="text-xs text-zinc-400">seguidores</p>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-zinc-900">{fmt(connected.avgViews)}</p>
                      <p className="text-xs text-zinc-400">média de views</p>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-zinc-900">{connected.engagementRate}%</p>
                      <p className="text-xs text-zinc-400">engajamento</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="audience" className="mt-4 space-y-4">
            <div className="grid lg:grid-cols-3 gap-4">
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-zinc-800 mb-3">Faixa etária</h3>
                {creator.audienceAge.map((a) => (
                  <div key={a.range} className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-zinc-500 w-12">{a.range}</span>
                    <Progress value={a.pct} className="h-2 flex-1" />
                    <span className="text-xs text-zinc-700 w-8 text-right">{a.pct}%</span>
                  </div>
                ))}
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-zinc-800 mb-3">Gênero</h3>
                {creator.audienceGender.map((g) => (
                  <div key={g.label} className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-zinc-500 w-16">{g.label}</span>
                    <Progress value={g.pct} className="h-2 flex-1" />
                    <span className="text-xs text-zinc-700 w-8 text-right">{g.pct}%</span>
                  </div>
                ))}
              </Card>
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-zinc-800 mb-3">Principais cidades</h3>
                {creator.audienceLocation.map((l) => (
                  <div key={l.city} className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-zinc-500 w-20">{l.city}</span>
                    <Progress value={l.pct} className="h-2 flex-1" />
                    <span className="text-xs text-zinc-700 w-8 text-right">{l.pct}%</span>
                  </div>
                ))}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <Card className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-zinc-900">Informações de contato</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Nome completo</Label>
                  <Input defaultValue={creator.name} />
                </div>
                <div className="space-y-1.5">
                  <Label>E-mail</Label>
                  <Input defaultValue={creator.email} />
                </div>
                <div className="space-y-1.5">
                  <Label>Telefone</Label>
                  <Input defaultValue={creator.phone} />
                </div>
                <div className="space-y-1.5">
                  <Label>Localização</Label>
                  <Input defaultValue={creator.location} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Bio</Label>
                <textarea
                  className="w-full h-20 px-3 py-2 text-sm border border-zinc-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  defaultValue={creator.bio}
                />
              </div>
              <Separator />
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancelar</Button>
                <Button>Salvar alterações</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
