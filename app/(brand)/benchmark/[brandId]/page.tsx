"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { BrandCompare } from "@/components/tracking/brand-compare"
import { useTrackingView } from "@/components/tracking/use-tracking"
import { TopBar } from "@/components/layout/top-bar"
import { Button } from "@/components/ui/button"
import { brandById, postsFor, projectBrand } from "@/lib/mock-data/tracking"

export default function TrackingBrandPage() {
  const params = useParams<{ brandId: string }>()
  const brandId = typeof params.brandId === "string" ? params.brandId : ""
  const { user, ready, organizationId, catalog, config, snapshots } = useTrackingView()

  const found = brandById(organizationId, brandId)
  const competitor = found && found.id !== catalog.own.id ? found : undefined
  const own = useMemo(() => projectBrand(catalog.own, config), [catalog.own, config])
  const other = useMemo(
    () => (competitor ? projectBrand(competitor, config) : null),
    [competitor, config],
  )
  const posts = useMemo(
    () => (competitor ? postsFor([catalog.own.id, competitor.id], config) : []),
    [catalog.own.id, competitor, config],
  )

  if (!user || !ready) return null

  if (!competitor || !other) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar
          title="Marca não encontrada"
          subtitle="Escolha uma concorrente na lista de Benchmark."
          leading={
            <Link href="/benchmark">
              <Button variant="outline" size="sm">
                <ArrowLeft />
                Voltar
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title={competitor.name}
        subtitle={`Comparativo com ${catalog.own.name}`}
        leading={
          <Link href="/benchmark">
            <Button variant="outline" size="sm">
              <ArrowLeft />
              Voltar
            </Button>
          </Link>
        }
      />
      <div className="p-6">
        <BrandCompare
          own={own}
          competitor={other}
          setSnapshots={snapshots.some((item) => item.brand.id === competitor.id) ? snapshots : [...snapshots, other]}
          config={config}
          posts={posts}
          brands={[catalog.own, competitor]}
        />
      </div>
    </div>
  )
}
