"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

// Magic UI / 21st.dev-inspired motion primitives, CSS + IntersectionObserver.
// They only animate on the rendered landing page (live); the builder stays static.

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === "undefined") {
      const raf = requestAnimationFrame(() => setInView(true))
      return () => cancelAnimationFrame(raf)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return { ref, inView }
}

// BlurFade — fade + blur + rise when scrolled into view.
export function Reveal({
  children,
  delay = 0,
  active = true,
  className,
}: {
  children: React.ReactNode
  delay?: number
  active?: boolean
  className?: string
}) {
  const { ref, inView } = useInView<HTMLDivElement>()
  if (!active) return <>{children}</>
  return (
    <div
      ref={ref}
      data-shown={inView}
      className={cn("site-reveal", className)}
      style={{ "--site-reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  )
}

// BorderBeam — a light traveling around the element's border.
export function BorderBeam({ color, duration = 5 }: { color?: string; duration?: number }) {
  return (
    <span
      aria-hidden
      className="site-beam"
      style={{ "--site-beam-color": color, "--site-beam-duration": `${duration}s` } as React.CSSProperties}
    />
  )
}

const NUMBER_RE = /\d[\d.,]*/

function countDecimals(token: string) {
  const index = token.indexOf(",")
  return index >= 0 ? token.length - index - 1 : 0
}

function toNumber(token: string) {
  let value = token
  if (value.includes(",")) {
    value = value.replace(/\./g, "").replace(",", ".")
  } else if (/^\d{1,3}(\.\d{3})+$/.test(value)) {
    value = value.replace(/\./g, "")
  }
  const parsed = parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function renderAt(current: number, token: string, full: string) {
  const decimals = countDecimals(token)
  const formatted = current.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return full.replace(token, formatted)
}

// NumberTicker — counts the numeric part of a string up from zero on view.
export function NumberTicker({
  value,
  animate = true,
  className,
}: {
  value: string
  animate?: boolean
  className?: string
}) {
  const match = value.match(NUMBER_RE)
  const { ref, inView } = useInView<HTMLSpanElement>()
  const [text, setText] = useState(() => (animate && match ? renderAt(0, match[0], value) : value))

  useEffect(() => {
    if (!animate || !inView) return
    const token = value.match(NUMBER_RE)?.[0]
    if (!token) return
    const target = toNumber(token)
    const duration = 1200
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      if (progress < 1) {
        setText(renderAt(target * eased, token, value))
        raf = requestAnimationFrame(tick)
      } else {
        setText(value)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [animate, inView, value])

  if (!animate || !match) return <span className={className}>{value}</span>
  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  )
}
