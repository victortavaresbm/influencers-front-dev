const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s].*)?$/

/** Formats YYYY-MM-DD (or an ISO datetime) as DD/MM/YYYY. */
export function formatDateBR(value?: string | null): string {
  if (!value) return ""
  const match = value.trim().match(ISO_DATE)
  if (!match) return value
  return `${match[3]}/${match[2]}/${match[1]}`
}

export function formatDateRangeBR(
  start?: string | null,
  end?: string | null,
  empty = "A definir",
): string {
  const startLabel = formatDateBR(start)
  const endLabel = formatDateBR(end)
  if (startLabel && endLabel) return `${startLabel} → ${endLabel}`
  return startLabel || endLabel || empty
}
