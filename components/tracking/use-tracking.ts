"use client"

import { useMemo, useSyncExternalStore } from "react"
import {
  catalogFor,
  monitoredBrands,
  postsFor,
  projectBrand,
  resolveConfig,
} from "@/lib/mock-data/tracking"
import { useAuthStore } from "@/lib/stores/auth"
import { useTrackingStore } from "@/lib/stores/tracking"

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

export function useTrackingView() {
  const user = useAuthStore((state) => state.user)
  const saved = useTrackingStore((state) => (user ? state.byOrg[user.organizationId] : undefined))
  const ready = useHydrated()
  const organizationId = user?.organizationId ?? "org1"
  const catalog = useMemo(() => catalogFor(organizationId), [organizationId])
  const config = useMemo(() => resolveConfig(organizationId, saved), [organizationId, saved])
  const brands = useMemo(() => monitoredBrands(organizationId, config), [organizationId, config])
  const snapshots = useMemo(() => brands.map((brand) => projectBrand(brand, config)), [brands, config])
  const posts = useMemo(() => postsFor(brands.map((brand) => brand.id), config), [brands, config])
  return { user, ready, organizationId, catalog, config, brands, snapshots, posts }
}
