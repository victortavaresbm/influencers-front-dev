"use client"

import { useEffect, useId, useRef, useState } from "react"
import { MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { LocationPlace } from "@/lib/discovery/locations"
import { cn } from "@/lib/utils"

function placeDisplay(place: LocationPlace) {
  if (place.kind === "city") return `${place.name}, ${place.uf}, Brasil`
  if (place.kind === "state") return `${place.name}, Brasil`
  return place.label
}

function placeKindLabel(kind: LocationPlace["kind"]) {
  if (kind === "city") return "Cidade"
  if (kind === "state") return "Estado"
  return "País"
}

export function LocationSuggest({
  value,
  onChange,
  field,
  placeholder = "Cidade, estado ou país",
  pulse,
  className,
}: {
  value?: string
  onChange: (value: string) => void
  field?: string
  placeholder?: string
  pulse?: boolean
  className?: string
}) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [text, setText] = useState(value ?? "")
  const [open, setOpen] = useState(false)
  const [places, setPlaces] = useState<LocationPlace[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [active, setActive] = useState(0)

  useEffect(() => {
    setText(value ?? "")
  }, [value])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [])

  useEffect(() => {
    const query = text.trim()
    if (query.length < 2 || (value && query === value)) {
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
        setActive(0)
        setOpen(true)
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
  }, [text, value])

  function pick(place: LocationPlace) {
    const next = placeDisplay(place)
    setText(next)
    onChange(next)
    setPlaces([])
    setOpen(false)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || places.length === 0) {
      if (event.key === "Escape") setOpen(false)
      return
    }
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActive((current) => (current + 1) % places.length)
      return
    }
    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActive((current) => (current - 1 + places.length) % places.length)
      return
    }
    if (event.key === "Enter") {
      event.preventDefault()
      const place = places[active]
      if (place) pick(place)
      return
    }
    if (event.key === "Escape") {
      event.preventDefault()
      setOpen(false)
    }
  }

  const showList = open && (loading || error || places.length > 0 || text.trim().length >= 2)

  return (
    <div ref={rootRef} className={cn("relative mx-2 inline-flex min-w-[min(100%,18rem)] align-middle", className)}>
      <Input
        data-ai-field={field}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && places[active] ? `${listId}-${places[active].id}` : undefined}
        value={text}
        placeholder={placeholder}
        className={cn(
          "h-9 w-full rounded-full px-4 text-sm font-semibold",
          pulse && value && "animate-in zoom-in-95 duration-500",
        )}
        onChange={(event) => {
          setText(event.target.value)
          onChange(event.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          if (text.trim().length >= 2) setOpen(true)
        }}
        onKeyDown={onKeyDown}
      />
      {showList ? (
        <div
          id={listId}
          role="listbox"
          className="absolute top-[calc(100%+0.35rem)] left-0 z-30 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg"
        >
          {loading ? <p className="px-3 py-2.5 text-xs text-zinc-400">Buscando localidades…</p> : null}
          {error ? <p className="px-3 py-2.5 text-xs text-red-600">{error}</p> : null}
          {!loading && !error && places.length === 0 ? (
            <p className="px-3 py-2.5 text-xs text-zinc-400">Nenhuma localidade encontrada.</p>
          ) : null}
          {places.map((place, index) => (
            <button
              key={place.id}
              id={`${listId}-${place.id}`}
              type="button"
              role="option"
              aria-selected={index === active}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors",
                index === active ? "bg-zinc-100" : "hover:bg-zinc-50",
              )}
              onMouseEnter={() => setActive(index)}
              onClick={() => pick(place)}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                <MapPin className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-zinc-900">{placeDisplay(place)}</span>
                <span className="block text-[11px] text-zinc-400">{placeKindLabel(place.kind)}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
