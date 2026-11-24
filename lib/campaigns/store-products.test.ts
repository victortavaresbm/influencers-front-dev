import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { filterItems, formatPrice, thumbnailUrl, toPickerItems, toggleStoreProduct, type ProductSelectionView, type StoreProduct } from "./store-products"

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
    assert.deepEqual(
      items.map((item) => ({ key: item.key, name: item.name })),
      [{ key: `${CONN}:1`, name: "Camiseta" }]
    )
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

const plain = (text: string | null) => text?.replace(/\u00a0/g, " ") ?? null

describe("formatPrice", () => {
  it("formata centavos na moeda", () => {
    assert.equal(plain(formatPrice({ amountCents: 7990, currency: "BRL" }, "pt")), "R$ 79,90")
    assert.equal(plain(formatPrice({ amountCents: 1000, currency: "USD" }, "en")), "$10.00")
  })

  it("sem preço → null", () => {
    assert.equal(formatPrice(null), null)
    assert.equal(formatPrice(undefined), null)
    assert.equal(formatPrice({ amountCents: -1, currency: "BRL" }), null)
    assert.equal(formatPrice({ amountCents: 100, currency: "R$" }), null)
  })
})

describe("thumbnailUrl", () => {
  it("pede miniatura no CDN da Shopify", () => {
    const url = new URL(thumbnailUrl("https://cdn.shopify.com/s/files/1/x.jpg?v=1") ?? "")
    assert.equal(url.searchParams.get("width"), "320")
    assert.equal(url.searchParams.get("v"), "1")
  })

  it("outras lojas mantêm a URL", () => {
    assert.equal(thumbnailUrl("https://acdn.nuvemshop.com.br/a.jpg"), "https://acdn.nuvemshop.com.br/a.jpg")
  })

  it("recusa o que não é https", () => {
    for (const bad of ["http://cdn.shopify.com/x.jpg", "javascript:alert(1)", "", null, undefined]) {
      assert.equal(thumbnailUrl(bad), null, String(bad))
    }
  })
})

describe("toPickerItems com foto, preço e formato", () => {
  it("carrega foto, preço e formato", () => {
    const [item] = toPickerItems(
      CONN,
      view([{ externalProductId: "1", name: "Curso", imageUrl: "https://acdn.nuvemshop.com.br/a.jpg", price: { amountCents: 14700, currency: "BRL" }, format: "ONLINE_COURSE" }]),
      "pt"
    )
    assert.equal(item.imageUrl, "https://acdn.nuvemshop.com.br/a.jpg")
    assert.equal(plain(item.priceLabel), "R$ 147,00")
    assert.equal(item.format, "ONLINE_COURSE")
  })

  it("sem foto nem preço fica null", () => {
    const [item] = toPickerItems(CONN, view([{ externalProductId: "1", name: "X" }]))
    assert.equal(item.imageUrl, null)
    assert.equal(item.priceLabel, null)
    assert.equal(item.format, null)
  })
})

describe("filterItems", () => {
  const items = toPickerItems(CONN, view([
    { externalProductId: "1", name: "Camisetá Básica" },
    { externalProductId: "2", name: "Boné" },
  ]))

  it("busca sem acento e sem caixa", () => {
    assert.deepEqual(filterItems(items, "camiseta").map((i) => i.name), ["Camisetá Básica"])
    assert.deepEqual(filterItems(items, "BONE").map((i) => i.name), ["Boné"])
  })

  it("busca vazia devolve todos", () => {
    assert.equal(filterItems(items, "  ").length, 2)
  })
})
