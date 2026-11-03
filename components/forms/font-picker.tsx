"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  GOOGLE_FONTS,
  ensureGoogleFont,
  siteFontFamily,
} from "@/lib/google-fonts"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const ROW = 32

type FontRow =
  | { kind: "heading"; id: string; label: string }
  | { kind: "font"; id: string; label: string }

export function FontPicker({ value, onChange }: { value: string; onChange: (font: string) => void }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const [listHeight, setListHeight] = useState(288)
  const [preview, setPreview] = useState<ReadonlySet<string>>(() => new Set())
  const listRef = useRef<HTMLDivElement>(null)
  const sansLabel = t("forms.fontSans")
  const serifLabel = t("forms.fontSerif")
  const systemLabel = t("forms.fontSystem")
  const googleLabel = t("forms.fontGoogle")
  const label = value === "serif" ? serifLabel : value === "sans" ? sansLabel : value

  useEffect(() => {
    ensureGoogleFont(value)
  }, [value])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const system = [
      { kind: "font" as const, id: "sans", label: sansLabel },
      { kind: "font" as const, id: "serif", label: serifLabel },
    ].filter((item) => !q || item.label.toLowerCase().includes(q) || item.id.includes(q))
    const google = (q ? GOOGLE_FONTS.filter(([family]) => family.toLowerCase().includes(q)) : GOOGLE_FONTS).map(
      ([family]) => ({ kind: "font" as const, id: family, label: family }),
    )
    const next: FontRow[] = []
    if (system.length > 0) next.push({ kind: "heading", id: "system", label: systemLabel }, ...system)
    if (google.length > 0) next.push({ kind: "heading", id: "google", label: googleLabel }, ...google)
    return next
  }, [googleLabel, query, sansLabel, serifLabel, systemLabel])

  const googleCount = rows.reduce((count, row) => count + (row.kind === "font" && row.id !== "sans" && row.id !== "serif" ? 1 : 0), 0)

  useEffect(() => {
    setActive(rows.findIndex((row) => row.kind === "font"))
    setScrollTop(0)
    if (listRef.current) listRef.current.scrollTop = 0
  }, [query, rows])

  useEffect(() => {
    if (!open || query.trim().length === 0 || googleCount > 40) return
    for (const row of rows) {
      if (row.kind === "font") ensureGoogleFont(row.id)
    }
  }, [open, query, googleCount, rows])

  useEffect(() => {
    const list = listRef.current
    if (!list || active < 0) return
    const top = active * ROW
    if (top < list.scrollTop) list.scrollTop = top
    else if (top + ROW > list.scrollTop + list.clientHeight) list.scrollTop = top + ROW - list.clientHeight
  }, [active])

  const start = Math.max(0, Math.floor(scrollTop / ROW) - 4)
  const end = Math.min(rows.length, start + Math.ceil(listHeight / ROW) + 8)
  const windowRows = rows.slice(start, end)

  const choose = (font: string) => {
    onChange(font)
    setOpen(false)
    setQuery("")
  }

  const moveActive = (direction: 1 | -1) => {
    setActive((current) => {
      let next = current
      do {
        next += direction
      } while (rows[next] && rows[next].kind !== "font")
      if (!rows[next] || rows[next].kind !== "font") return current
      return next
    })
  }

  const previewFont = (id: string) => {
    if (id === "sans" || id === "serif") return
    ensureGoogleFont(id)
    setPreview((current) => {
      if (current.has(id)) return current
      const next = new Set(current)
      next.add(id)
      return next
    })
  }

  const resizeList = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    const startY = event.clientY
    const startHeight = listHeight
    const max = Math.max(160, Math.min(window.innerHeight * 0.7, 640))
    const previousCursor = document.body.style.cursor
    const previousSelect = document.body.style.userSelect
    document.body.style.cursor = "row-resize"
    document.body.style.userSelect = "none"
    const move = (ev: PointerEvent) => {
      const next = startHeight + (startY - ev.clientY)
      setListHeight(Math.round(Math.min(max, Math.max(160, next))))
    }
    const stop = () => {
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousSelect
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", stop)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", stop)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
    >
      <PopoverTrigger
        render={
          <Button type="button" variant="outline" className="w-full min-w-0 justify-between font-normal" />
        }
      >
        <span className="truncate" style={{ fontFamily: siteFontFamily(value) }}>
          {label}
        </span>
        <ChevronDown className="text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="start" side="top" className="w-72 p-0">
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label={t("forms.resizeHeight")}
          aria-valuemin={160}
          aria-valuemax={640}
          aria-valuenow={listHeight}
          className="flex h-2 cursor-row-resize items-center justify-center"
          onPointerDown={resizeList}
        >
          <span className="h-1 w-8 rounded-full bg-zinc-300" />
        </div>
        <div className="p-2 pb-0">
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault()
                moveActive(1)
              } else if (event.key === "ArrowUp") {
                event.preventDefault()
                moveActive(-1)
              } else if (event.key === "Enter") {
                event.preventDefault()
                const row = rows[active]
                if (row?.kind === "font") choose(row.id)
              }
            }}
            placeholder={t("forms.fontSearch")}
            aria-label={t("forms.fontSearch")}
            aria-controls="site-font-list"
          />
        </div>
        {rows.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t("forms.fontEmpty")}</p>
        ) : (
          <div
            id="site-font-list"
            ref={listRef}
            role="listbox"
            aria-label={t("forms.themeFont")}
            className="overflow-y-auto"
            style={{ height: listHeight }}
            onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
          >
            <div className="relative" style={{ height: rows.length * ROW }}>
              <div className="absolute inset-x-0" style={{ top: start * ROW }}>
                {windowRows.map((row, index) => {
                  const rowIndex = start + index
                  if (row.kind === "heading") {
                    return (
                      <p key={row.id} className="flex h-8 items-center px-2 text-xs font-medium text-zinc-400">
                        {row.label}
                      </p>
                    )
                  }
                  const selected = row.id === value
                  const showFace =
                    selected ||
                    preview.has(row.id) ||
                    (query.trim().length > 0 && googleCount <= 40 && row.id !== "sans" && row.id !== "serif")
                  return (
                    <Button
                      key={row.id}
                      type="button"
                      variant="ghost"
                      role="option"
                      aria-selected={selected}
                      onMouseEnter={() => {
                        setActive(rowIndex)
                        previewFont(row.id)
                      }}
                      onClick={() => choose(row.id)}
                      className={cn("h-8 w-full justify-start px-2 font-normal", rowIndex === active && "bg-zinc-100")}
                      style={{ fontFamily: showFace ? siteFontFamily(row.id) : undefined }}
                    >
                      <span className="truncate">{row.label}</span>
                      {selected ? <Check className="ml-auto" /> : null}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
