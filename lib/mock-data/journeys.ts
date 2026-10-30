export type JourneyEventType =
  | "page_view"
  | "view_content"
  | "add_to_cart"
  | "begin_checkout"
  | "purchase"

export type PurchaseRole = "discovery" | "assist" | "conversion"

export type VisitorStatus = "visitor" | "cart" | "checkout" | "customer" | "abandoned"

export interface VisitorLocation {
  city: string
  state: string
  lat: number
  lng: number
}

export interface JourneyTouch {
  id: string
  creatorId: string
  creatorName: string
  creatorHandle: string
  creatorAvatar: string
  campaignId?: string
  campaignName?: string
  linkUrl: string
  referrer?: string
  at: string
}

export interface JourneyEvent {
  id: string
  type: JourneyEventType
  at: string
  page?: string
  productName?: string
  value?: number
  currency?: string
  touchId?: string
}

export interface PurchaseRoleEntry {
  creatorId: string
  creatorName: string
  creatorHandle: string
  creatorAvatar: string
  role: PurchaseRole
  touchAt: string
}

export interface JourneyOrder {
  id: string
  externalId: string
  value: number
  currency: string
  couponCode?: string
  couponCreatorId?: string
  confirmedByStore: boolean
  at: string
  roles: PurchaseRoleEntry[]
}

export interface Visitor {
  id: string
  organizationId: string
  emailHash?: string
  emailMasked?: string
  firstSeenAt: string
  lastSeenAt: string
  status: VisitorStatus
  location?: VisitorLocation
  touches: JourneyTouch[]
  events: JourneyEvent[]
  orders: JourneyOrder[]
}

// ── helpers ────────────────────────────────────────────────────────────────

export function visitorDisplayName(v: Visitor): string {
  if (v.emailMasked) return v.emailMasked
  return `Visitante ${v.id.slice(-4).toUpperCase()}`
}

export function latestTouch(v: Visitor): JourneyTouch | undefined {
  return [...v.touches].sort((a, b) => b.at.localeCompare(a.at))[0]
}

export function purchaseRoleFor(
  order: JourneyOrder,
  role: PurchaseRole
): PurchaseRoleEntry | undefined {
  return order.roles.find((r) => r.role === role)
}

// ── creator panorama aggregation ──────────────────────────────────────────

export interface CreatorJourneyStats {
  creatorId: string
  creatorName: string
  creatorHandle: string
  creatorAvatar: string
  visitorsBrought: number
  checkouts: number
  abandonments: number
  purchases: number
  revenueDiscovery: number
  revenueAssist: number
  revenueConversion: number
}

export function aggregateByCreator(visitors: Visitor[]): CreatorJourneyStats[] {
  const map = new Map<string, CreatorJourneyStats>()

  function ensure(touch: JourneyTouch): CreatorJourneyStats {
    if (!map.has(touch.creatorId)) {
      map.set(touch.creatorId, {
        creatorId: touch.creatorId,
        creatorName: touch.creatorName,
        creatorHandle: touch.creatorHandle,
        creatorAvatar: touch.creatorAvatar,
        visitorsBrought: 0,
        checkouts: 0,
        abandonments: 0,
        purchases: 0,
        revenueDiscovery: 0,
        revenueAssist: 0,
        revenueConversion: 0,
      })
    }
    return map.get(touch.creatorId)!
  }

  for (const visitor of visitors) {
    const seenCreators = new Set<string>()
    for (const touch of visitor.touches) {
      if (!seenCreators.has(touch.creatorId)) {
        ensure(touch).visitorsBrought++
        seenCreators.add(touch.creatorId)
      }
    }

    const hasCheckout = visitor.events.some((e) => e.type === "begin_checkout")
    const hasAbandon = visitor.status === "abandoned"
    const hasPurchase = visitor.status === "customer"

    for (const touch of visitor.touches) {
      const s = ensure(touch)
      if (hasCheckout) s.checkouts++
      if (hasAbandon) s.abandonments++
    }

    for (const order of visitor.orders) {
      for (const role of order.roles) {
        const s = map.get(role.creatorId) ?? ensure({
          id: `role-${role.creatorId}`,
          creatorId: role.creatorId,
          creatorName: role.creatorName,
          creatorHandle: role.creatorHandle,
          creatorAvatar: role.creatorAvatar,
          linkUrl: "",
          at: role.touchAt,
        })
        if (role.role === "discovery") { s.purchases++; s.revenueDiscovery += order.value }
        if (role.role === "assist") s.revenueAssist += order.value
        if (role.role === "conversion") s.revenueConversion += order.value
      }
    }
  }

  return [...map.values()].sort((a, b) => b.revenueConversion - a.revenueConversion)
}

export function formatBrl(value: number) {
  return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function cityKey(city: string, state: string) {
  return `${city}|${state}`
}

export interface CityAccess {
  key: string
  city: string
  state: string
  lat: number
  lng: number
  visitors: number
  purchases: number
  revenue: number
}

export function aggregateByCity(visitors: Visitor[]): CityAccess[] {
  const map = new Map<string, CityAccess>()

  for (const visitor of visitors) {
    const location = visitor.location
    if (!location) continue
    const key = cityKey(location.city, location.state)
    const current = map.get(key) ?? {
      key,
      city: location.city,
      state: location.state,
      lat: location.lat,
      lng: location.lng,
      visitors: 0,
      purchases: 0,
      revenue: 0,
    }
    current.visitors += 1
    current.purchases += visitor.orders.length
    current.revenue += visitor.orders.reduce((sum, order) => sum + order.value, 0)
    map.set(key, current)
  }

  return [...map.values()].sort((a, b) => b.visitors - a.visitors || b.revenue - a.revenue)
}

// ── mock data ─────────────────────────────────────────────────────────────

const CORE_VISITORS: Visitor[] = [
  // 1 — Ana trouxe, Bruno converteu (o caso clássico do plano)
  {
    id: "v1",
    organizationId: "org1",
    emailHash: "sha256:a1b2c3",
    emailMasked: "bi****@gmail.com",
    firstSeenAt: "2026-10-02T14:32:00Z",
    lastSeenAt: "2026-10-10T09:19:00Z",
    status: "customer",
    location: { city: "São Paulo", state: "SP", lat: -23.5505, lng: -46.6333 },
    touches: [
      {
        id: "t1",
        creatorId: "c1",
        creatorName: "Bianca Torres",
        creatorHandle: "@biancatorres",
        creatorAvatar: "BT",
        campaignId: "camp1",
        campaignName: "Lançamento Verão 2026",
        linkUrl: "go.wesell.app/c/bianca-vr",
        referrer: "instagram.com",
        at: "2026-10-02T14:32:00Z",
      },
      {
        id: "t2",
        creatorId: "c2",
        creatorName: "Pedro Alves",
        creatorHandle: "@pedroalves",
        creatorAvatar: "PA",
        campaignId: "camp1",
        campaignName: "Lançamento Verão 2026",
        linkUrl: "go.wesell.app/c/pedro-vr",
        referrer: "tiktok.com",
        at: "2026-10-10T09:15:00Z",
      },
    ],
    events: [
      { id: "e1", type: "page_view", at: "2026-10-02T14:32:00Z", page: "/", touchId: "t1" },
      { id: "e2", type: "view_content", at: "2026-10-02T14:33:00Z", page: "/produto/camiseta-premium", productName: "Camiseta Premium Oversized", value: 189, currency: "BRL", touchId: "t1" },
      { id: "e3", type: "add_to_cart", at: "2026-10-02T14:35:00Z", productName: "Camiseta Premium Oversized", value: 189, currency: "BRL", touchId: "t1" },
      { id: "e4", type: "begin_checkout", at: "2026-10-02T14:38:00Z", value: 189, currency: "BRL", touchId: "t1" },
      { id: "e5", type: "page_view", at: "2026-10-10T09:15:00Z", page: "/", touchId: "t2" },
      { id: "e6", type: "view_content", at: "2026-10-10T09:17:00Z", page: "/produto/camiseta-premium", productName: "Camiseta Premium Oversized", value: 189, currency: "BRL", touchId: "t2" },
      { id: "e7", type: "purchase", at: "2026-10-10T09:19:00Z", value: 189, currency: "BRL", touchId: "t2" },
    ],
    orders: [
      {
        id: "o1",
        externalId: "SHP-10041",
        value: 189,
        currency: "BRL",
        couponCode: "PEDRO10",
        couponCreatorId: "c2",
        confirmedByStore: true,
        at: "2026-10-10T09:19:00Z",
        roles: [
          { creatorId: "c1", creatorName: "Bianca Torres", creatorHandle: "@biancatorres", creatorAvatar: "BT", role: "discovery", touchAt: "2026-10-02T14:32:00Z" },
          { creatorId: "c2", creatorName: "Pedro Alves", creatorHandle: "@pedroalves", creatorAvatar: "PA", role: "conversion", touchAt: "2026-10-10T09:15:00Z" },
        ],
      },
    ],
  },
  // 2 — Conversão direta: único toque, compra imediata
  {
    id: "v2",
    organizationId: "org1",
    emailHash: "sha256:d4e5f6",
    emailMasked: "ca****@gmail.com",
    firstSeenAt: "2026-10-15T10:00:00Z",
    lastSeenAt: "2026-10-15T10:22:00Z",
    status: "customer",
    location: { city: "Rio de Janeiro", state: "RJ", lat: -22.9068, lng: -43.1729 },
    touches: [
      {
        id: "t3",
        creatorId: "c3",
        creatorName: "Carolina Souza",
        creatorHandle: "@carolsouza",
        creatorAvatar: "CS",
        campaignId: "camp1",
        campaignName: "Lançamento Verão 2026",
        linkUrl: "go.wesell.app/c/carol-vr",
        referrer: "instagram.com",
        at: "2026-10-15T10:00:00Z",
      },
    ],
    events: [
      { id: "e8", type: "page_view", at: "2026-10-15T10:00:00Z", page: "/", touchId: "t3" },
      { id: "e9", type: "view_content", at: "2026-10-15T10:05:00Z", page: "/produto/kit-verao", productName: "Kit Verão", value: 289, currency: "BRL", touchId: "t3" },
      { id: "e10", type: "add_to_cart", at: "2026-10-15T10:08:00Z", productName: "Kit Verão", value: 289, currency: "BRL", touchId: "t3" },
      { id: "e11", type: "begin_checkout", at: "2026-10-15T10:10:00Z", value: 289, currency: "BRL", touchId: "t3" },
      { id: "e12", type: "purchase", at: "2026-10-15T10:22:00Z", value: 289, currency: "BRL", touchId: "t3" },
    ],
    orders: [
      {
        id: "o2",
        externalId: "SHP-10055",
        value: 289,
        currency: "BRL",
        couponCode: "CAROL10",
        couponCreatorId: "c3",
        confirmedByStore: true,
        at: "2026-10-15T10:22:00Z",
        roles: [
          { creatorId: "c3", creatorName: "Carolina Souza", creatorHandle: "@carolsouza", creatorAvatar: "CS", role: "discovery", touchAt: "2026-10-15T10:00:00Z" },
          { creatorId: "c3", creatorName: "Carolina Souza", creatorHandle: "@carolsouza", creatorAvatar: "CS", role: "conversion", touchAt: "2026-10-15T10:00:00Z" },
        ],
      },
    ],
  },
  // 3 — Abandono: chegou ao checkout, não comprou
  {
    id: "v3",
    organizationId: "org1",
    firstSeenAt: "2026-10-18T19:14:00Z",
    lastSeenAt: "2026-10-18T19:28:00Z",
    status: "abandoned",
    location: { city: "Belo Horizonte", state: "MG", lat: -19.9167, lng: -43.9345 },
    touches: [
      {
        id: "t4",
        creatorId: "c1",
        creatorName: "Bianca Torres",
        creatorHandle: "@biancatorres",
        creatorAvatar: "BT",
        campaignId: "camp1",
        campaignName: "Lançamento Verão 2026",
        linkUrl: "go.wesell.app/c/bianca-vr",
        referrer: "instagram.com",
        at: "2026-10-18T19:14:00Z",
      },
    ],
    events: [
      { id: "e13", type: "page_view", at: "2026-10-18T19:14:00Z", page: "/", touchId: "t4" },
      { id: "e14", type: "view_content", at: "2026-10-18T19:16:00Z", page: "/produto/camiseta-premium", productName: "Camiseta Premium Oversized", value: 189, currency: "BRL", touchId: "t4" },
      { id: "e15", type: "add_to_cart", at: "2026-10-18T19:19:00Z", productName: "Camiseta Premium Oversized", value: 189, currency: "BRL", touchId: "t4" },
      { id: "e16", type: "begin_checkout", at: "2026-10-18T19:25:00Z", value: 189, currency: "BRL", touchId: "t4" },
    ],
    orders: [],
  },
  // 4 — Descoberta pura: só visitou, sem converter
  {
    id: "v4",
    organizationId: "org1",
    firstSeenAt: "2026-10-20T11:00:00Z",
    lastSeenAt: "2026-10-20T11:04:00Z",
    status: "visitor",
    location: { city: "Curitiba", state: "PR", lat: -25.4284, lng: -49.2733 },
    touches: [
      {
        id: "t5",
        creatorId: "c2",
        creatorName: "Pedro Alves",
        creatorHandle: "@pedroalves",
        creatorAvatar: "PA",
        campaignId: "camp1",
        campaignName: "Lançamento Verão 2026",
        linkUrl: "go.wesell.app/c/pedro-vr",
        referrer: "tiktok.com",
        at: "2026-10-20T11:00:00Z",
      },
    ],
    events: [
      { id: "e17", type: "page_view", at: "2026-10-20T11:00:00Z", page: "/", touchId: "t5" },
      { id: "e18", type: "view_content", at: "2026-10-20T11:02:00Z", page: "/produto/short-estampado", productName: "Short Estampado", value: 119, currency: "BRL", touchId: "t5" },
    ],
    orders: [],
  },
  // 5 — Três toques: descoberta, assistência e conversão em creators diferentes
  {
    id: "v5",
    organizationId: "org1",
    emailHash: "sha256:g7h8i9",
    emailMasked: "ma****@hotmail.com",
    firstSeenAt: "2026-10-05T08:00:00Z",
    lastSeenAt: "2026-10-22T16:45:00Z",
    status: "customer",
    location: { city: "Salvador", state: "BA", lat: -12.9777, lng: -38.5016 },
    touches: [
      {
        id: "t6",
        creatorId: "c3",
        creatorName: "Carolina Souza",
        creatorHandle: "@carolsouza",
        creatorAvatar: "CS",
        campaignId: "camp1",
        campaignName: "Lançamento Verão 2026",
        linkUrl: "go.wesell.app/c/carol-vr",
        referrer: "youtube.com",
        at: "2026-10-05T08:00:00Z",
      },
      {
        id: "t7",
        creatorId: "c1",
        creatorName: "Bianca Torres",
        creatorHandle: "@biancatorres",
        creatorAvatar: "BT",
        campaignId: "camp1",
        campaignName: "Lançamento Verão 2026",
        linkUrl: "go.wesell.app/c/bianca-vr",
        referrer: "instagram.com",
        at: "2026-10-14T20:30:00Z",
      },
      {
        id: "t8",
        creatorId: "c2",
        creatorName: "Pedro Alves",
        creatorHandle: "@pedroalves",
        creatorAvatar: "PA",
        campaignId: "camp1",
        campaignName: "Lançamento Verão 2026",
        linkUrl: "go.wesell.app/c/pedro-vr",
        referrer: "tiktok.com",
        at: "2026-10-22T16:30:00Z",
      },
    ],
    events: [
      { id: "e19", type: "page_view", at: "2026-10-05T08:00:00Z", page: "/", touchId: "t6" },
      { id: "e20", type: "view_content", at: "2026-10-05T08:03:00Z", page: "/produto/kit-verao", productName: "Kit Verão", value: 289, currency: "BRL", touchId: "t6" },
      { id: "e21", type: "page_view", at: "2026-10-14T20:30:00Z", page: "/", touchId: "t7" },
      { id: "e22", type: "view_content", at: "2026-10-14T20:32:00Z", page: "/produto/kit-verao", productName: "Kit Verão", value: 289, currency: "BRL", touchId: "t7" },
      { id: "e23", type: "add_to_cart", at: "2026-10-14T20:35:00Z", productName: "Kit Verão", value: 289, currency: "BRL", touchId: "t7" },
      { id: "e24", type: "page_view", at: "2026-10-22T16:30:00Z", page: "/", touchId: "t8" },
      { id: "e25", type: "view_content", at: "2026-10-22T16:33:00Z", page: "/produto/kit-verao", productName: "Kit Verão", value: 289, currency: "BRL", touchId: "t8" },
      { id: "e26", type: "begin_checkout", at: "2026-10-22T16:40:00Z", value: 289, currency: "BRL", touchId: "t8" },
      { id: "e27", type: "purchase", at: "2026-10-22T16:45:00Z", value: 289, currency: "BRL", touchId: "t8" },
    ],
    orders: [
      {
        id: "o3",
        externalId: "SHP-10089",
        value: 289,
        currency: "BRL",
        couponCode: "PEDRO10",
        couponCreatorId: "c2",
        confirmedByStore: true,
        at: "2026-10-22T16:45:00Z",
        roles: [
          { creatorId: "c3", creatorName: "Carolina Souza", creatorHandle: "@carolsouza", creatorAvatar: "CS", role: "discovery", touchAt: "2026-10-05T08:00:00Z" },
          { creatorId: "c1", creatorName: "Bianca Torres", creatorHandle: "@biancatorres", creatorAvatar: "BT", role: "assist", touchAt: "2026-10-14T20:30:00Z" },
          { creatorId: "c2", creatorName: "Pedro Alves", creatorHandle: "@pedroalves", creatorAvatar: "PA", role: "conversion", touchAt: "2026-10-22T16:30:00Z" },
        ],
      },
    ],
  },
  // 6 — Carrinho sem checkout (só add_to_cart)
  {
    id: "v6",
    organizationId: "org1",
    firstSeenAt: "2026-10-24T15:00:00Z",
    lastSeenAt: "2026-10-24T15:09:00Z",
    status: "cart",
    location: { city: "Fortaleza", state: "CE", lat: -3.7172, lng: -38.5433 },
    touches: [
      {
        id: "t9",
        creatorId: "c3",
        creatorName: "Carolina Souza",
        creatorHandle: "@carolsouza",
        creatorAvatar: "CS",
        campaignId: "camp1",
        campaignName: "Lançamento Verão 2026",
        linkUrl: "go.wesell.app/c/carol-vr",
        referrer: "instagram.com",
        at: "2026-10-24T15:00:00Z",
      },
    ],
    events: [
      { id: "e28", type: "page_view", at: "2026-10-24T15:00:00Z", page: "/", touchId: "t9" },
      { id: "e29", type: "view_content", at: "2026-10-24T15:04:00Z", page: "/produto/camiseta-premium", productName: "Camiseta Premium Oversized", value: 189, currency: "BRL", touchId: "t9" },
      { id: "e30", type: "add_to_cart", at: "2026-10-24T15:09:00Z", productName: "Camiseta Premium Oversized", value: 189, currency: "BRL", touchId: "t9" },
    ],
    orders: [],
  },
  // 7 — Compra sem link de creator (direto, mas com cupom)
  {
    id: "v7",
    organizationId: "org1",
    emailHash: "sha256:j0k1l2",
    emailMasked: "lu****@gmail.com",
    firstSeenAt: "2026-10-26T12:00:00Z",
    lastSeenAt: "2026-10-26T12:18:00Z",
    status: "customer",
    location: { city: "Brasília", state: "DF", lat: -15.7939, lng: -47.8828 },
    touches: [],
    events: [
      { id: "e31", type: "page_view", at: "2026-10-26T12:00:00Z", page: "/" },
      { id: "e32", type: "view_content", at: "2026-10-26T12:03:00Z", page: "/produto/short-estampado", productName: "Short Estampado", value: 119, currency: "BRL" },
      { id: "e33", type: "add_to_cart", at: "2026-10-26T12:07:00Z", productName: "Short Estampado", value: 119, currency: "BRL" },
      { id: "e34", type: "begin_checkout", at: "2026-10-26T12:10:00Z", value: 119, currency: "BRL" },
      { id: "e35", type: "purchase", at: "2026-10-26T12:18:00Z", value: 119, currency: "BRL" },
    ],
    orders: [
      {
        id: "o4",
        externalId: "SHP-10102",
        value: 119,
        currency: "BRL",
        couponCode: "BIANCA10",
        couponCreatorId: "c1",
        confirmedByStore: true,
        at: "2026-10-26T12:18:00Z",
        roles: [
          { creatorId: "c1", creatorName: "Bianca Torres", creatorHandle: "@biancatorres", creatorAvatar: "BT", role: "conversion", touchAt: "2026-10-26T12:18:00Z" },
        ],
      },
    ],
  },
]

const CREATOR_CARD = {
  c1: { creatorId: "c1", creatorName: "Bianca Torres", creatorHandle: "@biancatorres", creatorAvatar: "BT" },
  c2: { creatorId: "c2", creatorName: "Pedro Alves", creatorHandle: "@pedroalves", creatorAvatar: "PA" },
  c3: { creatorId: "c3", creatorName: "Carolina Souza", creatorHandle: "@carolsouza", creatorAvatar: "CS" },
} as const

type CreatorKey = keyof typeof CREATOR_CARD

interface VisitorSeed {
  id: string
  emailMasked?: string
  at: string
  status: VisitorStatus
  location: VisitorLocation
  creator: CreatorKey
  referrer: string
  value?: number
}

const VISITOR_SEEDS: VisitorSeed[] = [
  { id: "v8", emailMasked: "an****@gmail.com", at: "2026-10-08T13:10:00Z", status: "customer", location: { city: "São Paulo", state: "SP", lat: -23.5505, lng: -46.6333 }, creator: "c2", referrer: "tiktok.com", value: 249 },
  { id: "v9", emailMasked: "ju****@gmail.com", at: "2026-10-11T18:40:00Z", status: "customer", location: { city: "São Paulo", state: "SP", lat: -23.5505, lng: -46.6333 }, creator: "c1", referrer: "instagram.com", value: 189 },
  { id: "v10", at: "2026-10-19T21:05:00Z", status: "cart", location: { city: "São Paulo", state: "SP", lat: -23.5505, lng: -46.6333 }, creator: "c3", referrer: "instagram.com", value: 189 },
  { id: "v11", at: "2026-10-27T09:12:00Z", status: "visitor", location: { city: "São Paulo", state: "SP", lat: -23.5505, lng: -46.6333 }, creator: "c2", referrer: "tiktok.com" },
  { id: "v12", emailMasked: "ri****@outlook.com", at: "2026-10-12T16:20:00Z", status: "abandoned", location: { city: "Rio de Janeiro", state: "RJ", lat: -22.9068, lng: -43.1729 }, creator: "c1", referrer: "instagram.com", value: 189 },
  { id: "v13", at: "2026-10-21T11:48:00Z", status: "visitor", location: { city: "Rio de Janeiro", state: "RJ", lat: -22.9068, lng: -43.1729 }, creator: "c3", referrer: "youtube.com" },
  { id: "v14", emailMasked: "fe****@gmail.com", at: "2026-10-16T15:02:00Z", status: "customer", location: { city: "Belo Horizonte", state: "MG", lat: -19.9167, lng: -43.9345 }, creator: "c2", referrer: "tiktok.com", value: 349 },
  { id: "v15", emailMasked: "pa****@gmail.com", at: "2026-10-09T10:30:00Z", status: "customer", location: { city: "Curitiba", state: "PR", lat: -25.4284, lng: -49.2733 }, creator: "c3", referrer: "instagram.com", value: 189 },
  { id: "v16", emailMasked: "so****@gmail.com", at: "2026-10-17T19:11:00Z", status: "customer", location: { city: "Porto Alegre", state: "RS", lat: -30.0346, lng: -51.2177 }, creator: "c1", referrer: "instagram.com", value: 219 },
  { id: "v17", at: "2026-10-25T14:22:00Z", status: "visitor", location: { city: "Porto Alegre", state: "RS", lat: -30.0346, lng: -51.2177 }, creator: "c2", referrer: "tiktok.com" },
  { id: "v18", emailMasked: "ca****@uol.com.br", at: "2026-10-13T12:05:00Z", status: "customer", location: { city: "Campinas", state: "SP", lat: -22.9099, lng: -47.0626 }, creator: "c3", referrer: "instagram.com", value: 289 },
  { id: "v19", at: "2026-10-23T17:40:00Z", status: "cart", location: { city: "Florianópolis", state: "SC", lat: -27.5954, lng: -48.548 }, creator: "c1", referrer: "instagram.com", value: 189 },
  { id: "v20", at: "2026-10-07T20:18:00Z", status: "abandoned", location: { city: "Recife", state: "PE", lat: -8.0476, lng: -34.877 }, creator: "c2", referrer: "tiktok.com", value: 119 },
  { id: "v21", at: "2026-10-28T22:03:00Z", status: "visitor", location: { city: "Manaus", state: "AM", lat: -3.119, lng: -60.0217 }, creator: "c3", referrer: "youtube.com" },
  { id: "v22", at: "2026-10-06T08:44:00Z", status: "visitor", location: { city: "Goiânia", state: "GO", lat: -16.6869, lng: -49.2648 }, creator: "c1", referrer: "instagram.com" },
  { id: "v23", at: "2026-10-29T13:15:00Z", status: "checkout", location: { city: "Belém", state: "PA", lat: -1.4558, lng: -48.4902 }, creator: "c2", referrer: "tiktok.com", value: 189 },
  { id: "v24", emailMasked: "vi****@gmail.com", at: "2026-10-04T11:27:00Z", status: "customer", location: { city: "Vitória", state: "ES", lat: -20.3155, lng: -40.3128 }, creator: "c3", referrer: "youtube.com", value: 159 },
]

function visitorFromSeed(seed: VisitorSeed): Visitor {
  const creator = CREATOR_CARD[seed.creator]
  const value = seed.value ?? 189
  const moved = seed.status === "cart" || seed.status === "abandoned" || seed.status === "checkout" || seed.status === "customer"
  const reachedCheckout = seed.status === "abandoned" || seed.status === "checkout" || seed.status === "customer"
  const touchId = `${seed.id}-t`

  const events: JourneyEvent[] = [
    { id: `${seed.id}-e1`, type: "page_view", at: seed.at, page: "/", touchId },
  ]
  if (moved) {
    events.push({
      id: `${seed.id}-e2`,
      type: "add_to_cart",
      at: seed.at,
      productName: "Camiseta Premium Oversized",
      value,
      currency: "BRL",
      touchId,
    })
  }
  if (reachedCheckout) {
    events.push({ id: `${seed.id}-e3`, type: "begin_checkout", at: seed.at, value, currency: "BRL", touchId })
  }
  if (seed.status === "customer") {
    events.push({ id: `${seed.id}-e4`, type: "purchase", at: seed.at, value, currency: "BRL", touchId })
  }

  return {
    id: seed.id,
    organizationId: "org1",
    emailMasked: seed.emailMasked,
    firstSeenAt: seed.at,
    lastSeenAt: seed.at,
    status: seed.status,
    location: seed.location,
    touches: [
      {
        id: touchId,
        ...creator,
        campaignId: "camp1",
        campaignName: "Lançamento Verão 2026",
        linkUrl: `go.wesell.app/c/${seed.creator}`,
        referrer: seed.referrer,
        at: seed.at,
      },
    ],
    events,
    orders: seed.status === "customer"
      ? [
          {
            id: `${seed.id}-o`,
            externalId: `SHP-10${seed.id.slice(1).padStart(3, "0")}`,
            value,
            currency: "BRL",
            confirmedByStore: true,
            at: seed.at,
            roles: [
              { ...creator, role: "discovery", touchAt: seed.at },
              { ...creator, role: "conversion", touchAt: seed.at },
            ],
          },
        ]
      : [],
  }
}

export const VISITORS: Visitor[] = [
  ...CORE_VISITORS,
  ...VISITOR_SEEDS.map(visitorFromSeed),
]
