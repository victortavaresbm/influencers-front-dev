"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { QuotaBanner } from "@/components/discovery/quota-banner"
import { DiscoverPanel } from "@/components/discovery/discover-panel"
import { DiscoverResults } from "@/components/discovery/discover-results"
import { BulkSaveDialog } from "@/components/discovery/bulk-save-dialog"
import { SaveToListDialog } from "@/components/discovery/save-to-list-dialog"
import { CreatorSheet } from "@/components/discovery/creator-sheet"
import { TopBar } from "@/components/layout/top-bar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  extractPrompt,
  filterChips,
  isPlatform,
  matchingProfile,
  searchCreators,
  selectedNetworks,
  termsFromPost,
  type Platform,
} from "@/lib/discovery/discover-query"
import { type Creator } from "@/lib/mock-data/creators"
import { type MonitorPost } from "@/lib/mock-data/metrics"
import { useAuthStore } from "@/lib/stores/auth"
import { useCampaignStore } from "@/lib/stores/campaigns"
import { useCreatorStore } from "@/lib/stores/creators"
import { useDiscoverStore } from "@/lib/stores/discover"
import { useListStore } from "@/lib/stores/lists"
import { useI18n } from "@/lib/i18n"

export function DiscoverScreen({ platform }: { platform: Platform }) {
  const { t } = useI18n()
  const router = useRouter()
  const searchParams = useSearchParams()
  const creators = useCreatorStore((state) => state.creators)
  const selectCreator = useCreatorStore((state) => state.selectCreator)
  const selected = useCreatorStore((state) => state.selected)
  const drawerOpen = useCreatorStore((state) => state.drawerOpen)
  const setDrawerOpen = useCreatorStore((state) => state.setDrawerOpen)
  const query = useDiscoverStore((state) => state.query)
  const setMode = useDiscoverStore((state) => state.setMode)
  const hiddenIds = useDiscoverStore((state) => state.hiddenIds)
  const page = useDiscoverStore((state) => state.page)
  const campaignId = useDiscoverStore((state) => state.campaignId)
  const patchQuery = useDiscoverStore((state) => state.patchQuery)
  const resetQuery = useDiscoverStore((state) => state.resetQuery)
  const setPage = useDiscoverStore((state) => state.setPage)
  const toggleHidden = useDiscoverStore((state) => state.toggleHidden)
  const markOpened = useDiscoverStore((state) => state.markOpened)
  const ensureTrial = useDiscoverStore((state) => state.ensureTrial)
  const organizationId = useAuthStore((state) => state.user?.organizationId)
  const lists = useListStore((state) => state.lists)
  const campaigns = useCampaignStore((state) => state.campaigns)
  const [ready, setReady] = useState(false)
  const [hiddenView, setHiddenView] = useState(false)
  const [sheetTab, setSheetTab] = useState("posts")
  const [loading, setLoading] = useState(true)
  const [bulkIds, setBulkIds] = useState<string[] | null>(null)
  const [saveCreator, setSaveCreator] = useState<Creator | null>(null)
  const urlApplied = useRef(false)

  useEffect(() => {
    const finish = () => setReady(true)
    const unsub = useDiscoverStore.persist.onFinishHydration(finish)
    if (useDiscoverStore.persist.hasHydrated()) finish()
    else void useDiscoverStore.persist.rehydrate()
    return unsub
  }, [])

  useEffect(() => {
    if (!ready || urlApplied.current) return
    urlApplied.current = true
    ensureTrial()
    setMode("ai")
    const influencer = searchParams.get("influencer")
    if (influencer) {
      selectCreator(influencer)
      markOpened(influencer)
      setSheetTab(searchParams.get("collaborations") === "1" ? "collaborations" : "posts")
    }
  }, [ready, searchParams, ensureTrial, setMode, selectCreator, markOpened])

  const savedIds = useMemo(() => {
    const ids = new Set<string>()
    for (const list of lists) {
      if (list.organizationId !== organizationId) continue
      for (const id of list.creatorIds) ids.add(id)
    }
    return ids
  }, [lists, organizationId])

  const matched = useMemo(
    () => searchCreators(creators, query, { platform, savedIds, organizationId, creators }),
    [creators, query, platform, savedIds, organizationId]
  )
  const networks = selectedNetworks(query)
  const shown = hiddenView
    ? creators.filter((creator) => hiddenIds.includes(creator.id) && matchingProfile(creator, query))
    : matched
  const reference = creators.find((creator) => creator.id === query.lookalikeId) ?? null
  const chips = filterChips(query, creators)
  const campaign = campaigns.find((item) => item.id === campaignId) ?? null
  const signature = `${JSON.stringify(query)}:${platform}:${hiddenView}`

  useEffect(() => {
    if (!ready) return
    setLoading(true)
    const timer = window.setTimeout(() => setLoading(false), 280)
    return () => window.clearTimeout(timer)
  }, [signature, ready])

  function href(nextPlatform: Platform, influencer?: string | null, collaborations?: boolean) {
    const params = new URLSearchParams()
    if (influencer) {
      params.set("influencer", influencer)
      params.set("channel", nextPlatform.toUpperCase())
    }
    if (collaborations) params.set("collaborations", "1")
    const queryString = params.toString()
    return queryString ? `/discovery/${nextPlatform}?${queryString}` : `/discovery/${nextPlatform}`
  }

  function openCreator(creator: Creator, tab = "posts") {
    markOpened(creator.id)
    selectCreator(creator.id)
    setSheetTab(tab)
    router.replace(href(platform, creator.id, tab === "collaborations"))
  }

  function closeCreator() {
    setDrawerOpen(false)
    router.replace(href(platform))
  }

  return (
    <div className="flex h-screen min-h-0 max-h-screen flex-1 flex-col overflow-hidden">
      <TopBar title={t("pages.discovery")} subtitle="Busca" />
      <QuotaBanner />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {ready ? (
          <DiscoverPanel
            platform={platform}
            creators={creators}
            onPlatform={(next) => router.push(href(next, drawerOpen ? selected?.id : null, sheetTab === "collaborations"))}
          />
        ) : (
          <div className="h-[46vh] w-full shrink-0 border-b border-zinc-200 p-3 lg:h-full lg:w-[340px] lg:border-r lg:border-b-0">
            <Skeleton className="h-8 w-full" />
          </div>
        )}
        {ready ? (
          <DiscoverResults
            platform={platform}
            networks={networks}
            mode="ai"
            creators={shown}
            reference={hiddenView ? null : reference}
            hiddenIds={hiddenIds}
            hiddenView={hiddenView}
            loading={loading}
            page={page}
            chips={hiddenView ? [] : chips}
            campaign={hiddenView ? null : campaign}
            onPage={setPage}
            onOpen={(creator) => openCreator(creator, "posts")}
            onCollaborations={(creator) => openCreator(creator, "collaborations")}
            onLookalike={(creator) => {
              patchQuery({ lookalikeId: creator.id, creatorId: "" })
              setHiddenView(false)
              closeCreator()
            }}
            onSave={setSaveCreator}
            onToggleHidden={toggleHidden}
            onSearchInside={(post: MonitorPost) => patchQuery(extractPrompt(termsFromPost(post).join(" ")))}
            onSearchImage={(post: MonitorPost) =>
              patchQuery({
                imageLabel: `Imagem de ${post.creatorName}`,
                imageTerms: termsFromPost(post),
                prompt: "",
              })
            }
            onBulk={setBulkIds}
            onHiddenView={() => {
              setHiddenView((value) => !value)
              setPage(1)
            }}
            onClearChip={(chip) => patchQuery(chip.patch)}
            onClearAll={() => {
              resetQuery()
              setHiddenView(false)
            }}
          />
        ) : (
          <div className="flex-1 space-y-3 p-4">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        )}
      </div>

      <CreatorSheet
        creator={selected}
        platform={platform}
        campaign={campaign}
        open={drawerOpen}
        initialTab={sheetTab}
        onClose={closeCreator}
        onLookalikes={(creator) => {
          patchQuery({ lookalikeId: creator.id, creatorId: "" })
          setHiddenView(false)
          closeCreator()
        }}
      />
      <BulkSaveDialog
        open={bulkIds != null}
        onOpenChange={(open) => !open && setBulkIds(null)}
        creatorIds={bulkIds ?? []}
        fixedSelection={false}
      />
      <SaveToListDialog
        creatorId={saveCreator?.id ?? null}
        creatorName={saveCreator?.name ?? ""}
        open={saveCreator != null}
        onOpenChange={(open) => !open && setSaveCreator(null)}
      />
    </div>
  )
}
