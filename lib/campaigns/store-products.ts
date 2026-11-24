// Store products for the campaign wizard, as the sales service lists them
// (sales connection/dto/ProductSelectionView.java). The choice lives only in
// the campaign draft: it never changes which products earn commission.

export interface ProductSelectionView {
  mode: "ALL" | "SELECTED"
  products: {
    externalProductId: string
    name: string | null
    active: boolean
    selected: boolean
    needsReview: boolean
    participates: boolean
  }[]
}

export interface StoreProduct {
  connectionId: string
  externalProductId: string
  name: string
}

export interface PickerItem extends StoreProduct {
  key: string
}

export function productKey(product: Pick<StoreProduct, "connectionId" | "externalProductId">) {
  return `${product.connectionId}:${product.externalProductId}`
}

// Products removed or inactive in the store are left out.
export function toPickerItems(connectionId: string, view: ProductSelectionView): PickerItem[] {
  return view.products
    .filter((product) => product.active)
    .map((product) => ({
      key: productKey({ connectionId, externalProductId: product.externalProductId }),
      connectionId,
      externalProductId: product.externalProductId,
      name: product.name?.trim() || `Produto ${product.externalProductId}`,
    }))
}

export function toggleStoreProduct(selected: StoreProduct[], product: StoreProduct): StoreProduct[] {
  const key = productKey(product)
  return selected.some((item) => productKey(item) === key)
    ? selected.filter((item) => productKey(item) !== key)
    : [...selected, product]
}
