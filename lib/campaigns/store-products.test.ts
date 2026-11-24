import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { toPickerItems, toggleStoreProduct, type ProductSelectionView, type StoreProduct } from "./store-products"

const CONN = "0193a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b"

function view(products: Partial<ProductSelectionView["products"][number]>[]): ProductSelectionView {
  return {
    mode: "ALL",
    products: products.map((p) => ({
      externalProductId: "0",
      name: null,
      active: true,
      selected: false,
      needsReview: false,
      participates: true,
      ...p,
    })),
  }
}

describe("toPickerItems", () => {
  it("lista só produtos ativos, com nome", () => {
    const items = toPickerItems(CONN, view([
      { externalProductId: "1", name: "Camiseta", active: true },
      { externalProductId: "2", name: "Boné", active: false },
    ]))
    assert.deepEqual(items, [{ key: `${CONN}:1`, connectionId: CONN, externalProductId: "1", name: "Camiseta" }])
  })

  it("produto sem nome mostra o id", () => {
    const [item] = toPickerItems(CONN, view([{ externalProductId: "9", name: null }]))
    assert.equal(item.name, "Produto 9")
  })

  it("nome só com espaços também usa o id", () => {
    const [item] = toPickerItems(CONN, view([{ externalProductId: "7", name: "   " }]))
    assert.equal(item.name, "Produto 7")
  })
})

describe("toggleStoreProduct", () => {
  const camiseta: StoreProduct = { connectionId: CONN, externalProductId: "1", name: "Camiseta" }

  it("marca e desmarca pelo par conexão+produto", () => {
    const original: StoreProduct[] = []
    const marked = toggleStoreProduct(original, camiseta)
    assert.deepEqual(marked, [camiseta])
    assert.deepEqual(toggleStoreProduct(marked, camiseta), original)
  })

  it("a mesma chave nunca entra duas vezes", () => {
    const renamed = { ...camiseta, name: "Camiseta nova" }
    const once = toggleStoreProduct([camiseta], renamed)
    assert.equal(once.length, 0)
  })

  it("mesmo id em outra conexão é outro produto", () => {
    const other = { ...camiseta, connectionId: "outra" }
    assert.equal(toggleStoreProduct([camiseta], other).length, 2)
  })
})
