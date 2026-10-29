"use client"

import { useCallback, useRef } from "react"
import { flushSync } from "react-dom"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePreferencesStore, type Theme } from "@/lib/stores/preferences"

type AnimationType = "none" | "circle-spread"

interface ToggleThemeProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number
  animationType?: AnimationType
}

const CIRCLE_TRANSITION_CSS = `
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
    mix-blend-mode: normal;
  }
  ::view-transition-old(root) { z-index: 1; }
  ::view-transition-new(root) { z-index: 2147483646; }
`

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle("dark", theme === "dark")
  root.style.colorScheme = theme
  usePreferencesStore.getState().setTheme(theme)
}

export function startCircleThemeTransition(next: Theme, origin: HTMLElement, duration = 400) {
  const current = usePreferencesStore.getState().theme
  if (current === next) return

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  if (reduced || typeof document.startViewTransition !== "function") {
    applyTheme(next)
    return
  }

  const { top, left, width, height } = origin.getBoundingClientRect()
  const x = left + width / 2
  const y = top + height / 2
  const maxRadius = Math.hypot(
    Math.max(left, window.innerWidth - left),
    Math.max(top, window.innerHeight - top),
  )

  const style = document.createElement("style")
  style.dataset.themeTransition = "circle"
  style.textContent = CIRCLE_TRANSITION_CSS
  document.head.appendChild(style)

  let transition: ViewTransition
  try {
    transition = document.startViewTransition(() => {
      flushSync(() => {
        applyTheme(next)
      })
    })
  } catch {
    style.remove()
    applyTheme(next)
    return
  }

  const cleanup = () => style.remove()
  transition.finished.then(cleanup, cleanup)

  transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    )
  }, cleanup)
}

export const ToggleTheme = ({
  className,
  duration = 400,
  animationType = "circle-spread",
  children,
  onClick,
  ...props
}: ToggleThemeProps) => {
  const theme = usePreferencesStore((state) => state.theme)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const isDark = theme === "dark"

  const toggleTheme = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (event.defaultPrevented || !buttonRef.current) return
      const next: Theme = isDark ? "light" : "dark"
      if (animationType === "none") {
        applyTheme(next)
        return
      }
      startCircleThemeTransition(next, buttonRef.current, duration)
    },
    [animationType, duration, isDark, onClick],
  )

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggleTheme}
      aria-pressed={isDark}
      className={cn(
        "inline-flex items-center justify-center rounded-full p-2 transition-colors duration-300",
        className,
      )}
      {...props}
    >
      {children ?? (isDark ? <Sun className="size-4" /> : <Moon className="size-4" />)}
    </button>
  )
}
