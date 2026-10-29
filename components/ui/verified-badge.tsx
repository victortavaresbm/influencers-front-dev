import { cn } from "@/lib/utils"

const SEAL_POINTS = (() => {
  const spikes = 22
  const cx = 12
  const cy = 12
  const outer = 11.35
  const inner = 9.45
  const points: string[] = []
  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner
    const angle = (Math.PI / spikes) * i - Math.PI / 2
    points.push(
      `${(cx + Math.cos(angle) * radius).toFixed(2)},${(cy + Math.sin(angle) * radius).toFixed(2)}`
    )
  }
  return points.join(" ")
})()

export function VerifiedBadge({
  className,
  label = "Verificado",
}: {
  className?: string
  label?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-4 shrink-0", className)}
      role="img"
      aria-label={label}
    >
      <polygon points={SEAL_POINTS} fill="#0095F6" />
      <path
        d="M7.15 12.2 10.35 15.4 16.85 8.75"
        fill="none"
        stroke="#fff"
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
