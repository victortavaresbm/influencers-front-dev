"use client"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { isMarcaId } from "@/lib/api/client"

// The identity has no route that lists a User's Marcas yet, so the Marca the
// real account acts in is typed once and kept in the browser.
interface MarcaState {
  marcaId: string | null
  setMarcaId: (value: string) => boolean
}

const initial = process.env.NEXT_PUBLIC_DEV_MARCA_ID?.trim()

export const useMarcaStore = create<MarcaState>()(
  persist(
    (set) => ({
      marcaId: isMarcaId(initial) ? initial.toLowerCase() : null,
      setMarcaId: (value) => {
        const next = value.trim().toLowerCase()
        if (!isMarcaId(next)) return false
        set({ marcaId: next })
        return true
      },
    }),
    { name: "wesell-api" }
  )
)
