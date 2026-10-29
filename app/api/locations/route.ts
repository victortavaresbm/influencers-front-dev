import type { LocationPlace } from "@/lib/discovery/locations"

interface IbgeState {
  id: number
  sigla: string
  nome: string
}

interface IbgeCity {
  id: number
  nome: string
  microrregiao?: {
    mesorregiao?: { UF?: { sigla?: string } }
  } | null
  "regiao-imediata"?: {
    "regiao-intermediaria"?: { UF?: { sigla?: string } }
  } | null
}

function fold(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "")
}

let placesCache: LocationPlace[] | null = null
let loading: Promise<LocationPlace[]> | null = null

function cityUf(city: IbgeCity) {
  return city.microrregiao?.mesorregiao?.UF?.sigla
    ?? city["regiao-imediata"]?.["regiao-intermediaria"]?.UF?.sigla
    ?? ""
}

async function loadPlaces() {
  if (placesCache) return placesCache
  if (!loading) {
    loading = Promise.all([
      fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome", { next: { revalidate: 86400 } }),
      fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome", { next: { revalidate: 86400 } }),
    ]).then(async ([statesResponse, citiesResponse]) => {
      if (!statesResponse.ok || !citiesResponse.ok) {
        throw new Error("IBGE unavailable")
      }
      const states = (await statesResponse.json()) as IbgeState[]
      const cities = (await citiesResponse.json()) as IbgeCity[]
      const places: LocationPlace[] = [
        ...states.map((state) => ({
          id: `state-${state.id}`,
          kind: "state" as const,
          name: state.nome,
          uf: state.sigla,
          token: `state:${state.sigla}:${state.nome}`,
          label: state.nome,
        })),
        ...cities.flatMap((city) => {
          const uf = cityUf(city)
          if (!uf) return []
          return [{
            id: `city-${city.id}`,
            kind: "city" as const,
            name: city.nome,
            uf,
            token: `city:${city.nome}:${uf}`,
            label: `${city.nome}, ${uf}`,
          }]
        }),
      ]
      placesCache = places
      return places
    }).finally(() => {
      loading = null
    })
  }
  return loading
}

function rank(place: LocationPlace, query: string) {
  const name = fold(place.name)
  const uf = place.uf.toLowerCase()
  if (place.kind === "state" && (uf === query || name === query)) return 0
  if (name === query) return 1
  if (name.startsWith(query)) return 2
  if (uf === query) return 3
  if (name.includes(query)) return 4
  return 5
}

export async function GET(request: Request) {
  const query = fold(new URL(request.url).searchParams.get("q")?.trim() ?? "")
  if (query.length < 2) return Response.json({ places: [] as LocationPlace[] })

  try {
    const places = await loadPlaces()
    const stateNameByUf = new Map(
      places.filter((place) => place.kind === "state").map((place) => [place.uf.toLowerCase(), fold(place.name)])
    )
    const matches = places
      .filter((place) => {
        const name = fold(place.name)
        const uf = place.uf.toLowerCase()
        const capital = uf === query && name === stateNameByUf.get(uf)
        if (query.length <= 2) {
          if (place.kind === "state" && (uf === query || name.startsWith(query))) return true
          return capital || name.startsWith(query)
        }
        return name.includes(query)
      })
      .sort((a, b) => rank(a, query) - rank(b, query) || a.label.localeCompare(b.label, "pt"))
      .slice(0, 8)
    return Response.json({ places: matches })
  } catch {
    return Response.json({ error: "Não foi possível consultar as localidades do IBGE." }, { status: 502 })
  }
}
