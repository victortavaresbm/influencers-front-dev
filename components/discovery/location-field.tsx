"use client"

import { useEffect, useState } from "react"
import { MapPin, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { LocationPlace } from "@/lib/discovery/locations"
import { locationTokenLabel, locationTokens } from "@/lib/discovery/scope"
import { cn } from "@/lib/utils"

export function LocationField({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  const [text, setText] = useState("")
  const [places, setPlaces] = useState<LocationPlace[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const selected = locationTokens(value)

  useEffect(() => {
    const query = text.trim()
    if (query.length < 2) {
      setPlaces([])
      setError("")
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      setError("")
      try {
        const response = await fetch(`/api/locations?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        const body = (await response.json()) as { places?: LocationPlace[]; error?: string }
        if (!response.ok) {
          setPlaces([])
          setError(body.error ?? "Não foi possível consultar as localidades.")
          return
        }
        setPlaces(body.places ?? [])
      } catch (fetchError) {
        if (fetchError instanceof DOMException && fetchError.name === "AbortError") return
        setPlaces([])
        setError("Não foi possível consultar as localidades.")
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 250)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [text])

  function addPlace(place: LocationPlace) {
    if (selected.includes(place.token)) {
      setText("")
      setPlaces([])
      return
    }
    onChange([...selected, place.token].join("|"))
    setText("")
    setPlaces([])
  }

  return (
    <div className="space-y-1.5">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selected.map((token) => (
            <Badge key={token} variant="secondary" className="pr-0.5">
              <MapPin />
              {locationTokenLabel(token)}
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="size-4"
                aria-label={`Remover ${locationTokenLabel(token)}`}
                onClick={() => onChange(selected.filter((item) => item !== token).join("|"))}
              >
                <X />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      <Input
        placeholder={placeholder}
        className="h-8 bg-white text-sm"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.preventDefault()
        }}
      />
      {loading && <p className="text-[11px] text-zinc-400">Buscando no IBGE…</p>}
      {error && <p className="text-[11px] text-red-600">{error}</p>}
      {places.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          {places.map((place) => (
            <Button
              key={place.id}
              type="button"
              variant="ghost"
              className={cn("h-8 w-full justify-start rounded-none px-2 text-xs font-normal")}
              onClick={() => addPlace(place)}
            >
              <span className="truncate">{place.label}</span>
              <span className="ml-auto shrink-0 text-[10px] uppercase tracking-wide text-zinc-400">
                {place.kind === "state" ? "Estado" : "Cidade"}
              </span>
            </Button>
          ))}
        </div>
      )}
      {!loading && !error && text.trim().length >= 2 && places.length === 0 && (
        <p className="text-[11px] text-zinc-400">Nenhuma localidade encontrada.</p>
      )}
    </div>
  )
}
