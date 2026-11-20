"use client"

import { useEffect, useState } from "react"
import { AlignLeft, WandSparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface ChoiceOption<T extends string> {
  id: T
  label: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  iconClassName?: string
  mark?: string
}

export function QuestionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[1.65rem] font-semibold tracking-tight text-zinc-900">{children}</h2>
}

export function Sentence({ children, pulse }: { children: React.ReactNode; pulse?: boolean }) {
  return (
    <p className={cn("text-[1.35rem] font-medium leading-relaxed text-zinc-800", pulse && "animate-in fade-in zoom-in-95 duration-500")}>
      {children}
    </p>
  )
}

export function Token({
  selected,
  children,
  onClick,
  pulse,
  optionId,
}: {
  selected?: boolean
  children: React.ReactNode
  onClick?: () => void
  pulse?: boolean
  optionId?: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      aria-pressed={selected}
      data-ai-option={optionId}
      className={cn(
        "mx-1 inline-flex h-8 rounded-full px-3 text-sm font-semibold",
        selected
          ? "bg-zinc-900 text-white hover:bg-zinc-900 hover:text-white"
          : "border border-dashed border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50",
        pulse && selected && "animate-in zoom-in-95 duration-500",
      )}
    >
      {children}
    </Button>
  )
}

function OptionRow<T extends string>({ option }: { option: ChoiceOption<T> }) {
  const Icon = option.icon
  return (
    <span className="flex min-w-0 items-center gap-3 py-1 pr-2">
      {Icon ? (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
          <Icon className={cn("size-4 text-zinc-700", option.iconClassName)} />
        </span>
      ) : option.mark ? (
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-base">{option.mark}</span>
      ) : null}
      <span className="min-w-0 text-left">
        <span className="block text-sm font-semibold text-zinc-900">{option.label}</span>
        {option.description ? <span className="mt-0.5 block text-xs font-normal leading-5 text-zinc-500">{option.description}</span> : null}
      </span>
    </span>
  )
}

const menuItemClass = "items-start gap-0 rounded-xl px-2.5 py-2 pr-10 data-checked:bg-zinc-100"

function useAiMenu(field?: string) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!field) return
    const onOpen = (event: Event) => {
      const target = (event as CustomEvent<{ field: string }>).detail?.field
      setOpen(target === field)
    }
    const onClose = (event: Event) => {
      const next = (event as CustomEvent<{ field?: string }>).detail?.field
      if (!next || next === field) setOpen(false)
    }
    window.addEventListener("ai-open-menu", onOpen)
    window.addEventListener("ai-close-menu", onClose)
    return () => {
      window.removeEventListener("ai-open-menu", onOpen)
      window.removeEventListener("ai-close-menu", onClose)
    }
  }, [field])
  return [open, setOpen] as const
}

export function Choice<T extends string>({
  value,
  placeholder,
  options,
  onPick,
  pulse,
  field,
}: {
  value?: T
  placeholder: string
  options: ChoiceOption<T>[]
  onPick: (id: T) => void
  pulse?: boolean
  field?: string
}) {
  const current = options.find((option) => option.id === value)
  const Icon = current?.icon
  const [open, setOpen] = useAiMenu(field)
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        data-ai-field={field}
        render={
          <Button
            type="button"
            variant="ghost"
            data-ai-field={field}
            aria-pressed={Boolean(current)}
            className={cn(
              "mx-1 inline-flex h-9 rounded-full px-3 text-sm font-semibold",
              current
                ? "bg-zinc-900 text-white hover:bg-zinc-900 hover:text-white"
                : "border border-dashed border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50",
              pulse && current && "animate-in zoom-in-95 duration-500",
            )}
          />
        }
      >
        {current?.mark ? <span>{current.mark}</span> : null}
        {Icon ? <Icon className="size-3.5" /> : null}
        {current?.label ?? placeholder}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="!w-96 p-2">
        <DropdownMenuRadioGroup value={value ?? ""} onValueChange={(id) => { if (id) onPick(id as T) }}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.id} value={option.id} data-ai-option={option.id} className={menuItemClass}>
              <OptionRow option={option} />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function MultiChoice<T extends string>({
  values,
  placeholder,
  options,
  onToggle,
  pulse,
  field,
}: {
  values: T[]
  placeholder: string
  options: ChoiceOption<T>[]
  onToggle: (id: T) => void
  pulse?: boolean
  field?: string
}) {
  const picked = options.filter((option) => values.includes(option.id))
  const [open, setOpen] = useAiMenu(field)
  return (
    <span className="inline-flex align-middle">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          data-ai-field={field}
          render={
            <Button
              type="button"
              variant="ghost"
              data-ai-field={field}
              aria-pressed={picked.length > 0}
              className={cn(
                "mx-1 inline-flex !h-auto flex-wrap items-center gap-1.5 !whitespace-normal bg-transparent p-0 hover:bg-transparent",
                pulse && picked.length > 0 && "animate-in zoom-in-95 duration-500",
              )}
            />
          }
        >
          {picked.length === 0 ? (
            <span className="inline-flex h-9 items-center rounded-full border border-dashed border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-700">
              {placeholder}
            </span>
          ) : (
            picked.map((option) => {
              const Icon = option.icon
              return (
                <span key={option.id} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-zinc-900 px-3 text-sm font-semibold text-white">
                  {option.mark ? <span>{option.mark}</span> : null}
                  {Icon ? <Icon className="size-3.5" /> : null}
                  {option.label}
                </span>
              )
            })
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={8} className="!w-96 p-2">
          {options.map((option) => (
            <DropdownMenuCheckboxItem
              key={option.id}
              checked={values.includes(option.id)}
              closeOnClick={false}
              data-ai-option={option.id}
              className={menuItemClass}
              onCheckedChange={() => onToggle(option.id)}
            >
              <OptionRow option={option} />
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  )
}

export function YesNo({ value, onChange, pulse, field }: { value?: boolean; onChange: (value: boolean) => void; pulse?: boolean; field?: string }) {
  return (
    <span data-ai-field={field} className={cn("mx-1 inline-flex items-center gap-1 align-middle", pulse && "animate-in zoom-in-95 duration-500")}>
      <Token selected={value === true} optionId="true" onClick={() => onChange(true)}>Sim</Token>
      <Token selected={value === false} optionId="false" onClick={() => onChange(false)}>Não</Token>
    </span>
  )
}

export function AgePills({ values, options, onToggle, pulse, field }: { values: string[]; options: string[]; onToggle: (value: string) => void; pulse?: boolean; field?: string }) {
  return (
    <div data-ai-field={field} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = values.includes(option)
        return (
          <Button
            key={option}
            type="button"
            variant="ghost"
            aria-pressed={selected}
            data-ai-option={option}
            onClick={() => onToggle(option)}
            className={cn(
              "h-10 rounded-full px-4 text-sm font-semibold",
              selected ? "bg-zinc-900 text-white hover:bg-zinc-900 hover:text-white" : "border border-dashed border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50",
              pulse && selected && "animate-in zoom-in-95 duration-500",
            )}
          >
            {option}
          </Button>
        )
      })}
    </div>
  )
}

export function MagicCursor({ x, y, clicking }: { x: number; y: number; clicking?: boolean }) {
  return (
    <div
      className="pointer-events-none fixed z-[80] transition-[left,top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{ left: x, top: y }}
    >
      <span
        className={cn(
          "absolute -left-2.5 -top-2.5 size-5 rounded-full border-2 border-zinc-900 bg-white/70 transition-transform",
          clicking && "scale-75 bg-zinc-900/20",
        )}
      />
      {clicking ? <span className="absolute -left-3 -top-3 size-6 animate-ping rounded-full bg-zinc-900/25" /> : null}
      <WandSparkles className="-translate-x-1 -translate-y-7 size-7 text-zinc-900 drop-shadow-[0_8px_12px_rgba(24,24,27,0.25)]" />
    </div>
  )
}

export function Insight({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-zinc-700">
      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-700">
        <AlignLeft className="size-3.5" />
      </span>
      <p>{children}</p>
    </div>
  )
}
