export interface LocationPlace {
  id: string
  kind: "city" | "state" | "country"
  name: string
  uf: string
  token: string
  label: string
}
