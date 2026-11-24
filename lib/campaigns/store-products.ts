// Store products for the campaign wizard, as the sales service lists them
// (sales connection/dto/ProductSelectionView.java). The choice lives only in
// the campaign draft: it never changes which products earn commission.

export interface ProductPrice {
  amountCents: number
  currency: string
}

export interface ProductSelectionView {
  mode: "ALL" | "SELECTED"
  products: {
    externalProductId: string
    name: string | null
    active: boolean
    selected: boolean
    needsReview: boolean
    participates: boolean
    // sales#145 / sales#146; older answers leave them out.
    imageUrl?: string | null
    price?: ProductPrice | null
    format?: string | null
  }[]
}

export interface StoreProduct {
  connectionId: string
  externalProductId: string
  name: string
  imageUrl?: string | null
  priceLabel?: string | null
}

export interface PickerItem extends StoreProduct {
  key: string
  imageUrl: string | null
  priceLabel: string | null
  format: string | null
}

export type UiLocale = "pt" | "en" | "es"

const INTL_LOCALE: Record<UiLocale, string> = { pt: "pt-BR", en: "en-US", es: "es" }

export function productKey(product: Pick<StoreProduct, "connectionId" | "externalProductId">) {
  return `${product.connectionId}:${product.externalProductId}`
}

export function formatPrice(price: ProductPrice | null | undefined, locale: UiLocale = "pt"): string | null {
  if (!price || !Number.isInteger(price.amountCents) || price.amountCents < 0) return null
  if (!/^[A-Z]{3}$/.test(price.currency)) return null
  try {
    return new Intl.NumberFormat(INTL_LOCALE[locale], { style: "currency", currency: price.currency }).format(
      price.amountCents / 100
    )
  } catch {
    return null
  }
}

// The photo comes from the store's CDN: only https leaves for the browser.
// Shopify's CDN resizes on request, so the card asks a small one.
export function thumbnailUrl(raw: string | null | undefined, width = 320): string | null {
  if (!raw) return null
  try {
    const url = new URL(raw)
    if (url.protocol !== "https:") return null
    if (url.hostname === "cdn.shopify.com") url.searchParams.set("width", String(width))
    return url.toString()
  } catch {
    return null
  }
}

// Products removed or inactive in the store are left out.
export function toPickerItems(connectionId: string, view: ProductSelectionView, locale: UiLocale = "pt"): PickerItem[] {
  return view.products
    .filter((product) => product.active)
    .map((product) => ({
      key: productKey({ connectionId, externalProductId: product.externalProductId }),
      connectionId,
      externalProductId: product.externalProductId,
      name: product.name?.trim() || `Produto ${product.externalProductId}`,
      imageUrl: thumbnailUrl(product.imageUrl),
      priceLabel: formatPrice(product.price, locale),
      format: product.format ?? null,
    }))
}

const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()

export function filterItems<T extends { name: string }>(items: T[], query: string): T[] {
  const needle = fold(query.trim())
  return needle ? items.filter((item) => fold(item.name).includes(needle)) : items
}

export function toggleStoreProduct(selected: StoreProduct[], product: StoreProduct): StoreProduct[] {
  const key = productKey(product)
  return selected.some((item) => productKey(item) === key)
    ? selected.filter((item) => productKey(item) !== key)
    : [...selected, product]
}
