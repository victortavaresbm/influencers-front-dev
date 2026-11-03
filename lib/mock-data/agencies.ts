export interface Agency {
  id: string
  name: string
  email: string
}

export const AGENCIES: Agency[] = [
  { id: "ag-fenomeno", name: "Fenômeno", email: "parcerias@fenomeno.com" },
  { id: "ag-mynd", name: "Mynd", email: "contato@mynd.com.br" },
  { id: "ag-air", name: "Air", email: "talentos@air.ag" },
  { id: "ag-play9", name: "Play9", email: "comercial@play9.com.br" },
  { id: "ag-box", name: "Box 1824", email: "hello@box1824.com" },
]

export function agencyById(id: string | undefined) {
  if (!id) return undefined
  return AGENCIES.find((agency) => agency.id === id)
}
