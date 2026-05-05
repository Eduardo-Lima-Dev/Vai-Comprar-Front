const plannedFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

export function formatPlannedDateRaw(iso: string | null | undefined): string {
  if (!iso) return 'Definir data'
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return 'Definir data'
    const parts = plannedFormatter.formatToParts(d)
    let weekday = ''
    let day = ''
    let month = ''
    for (const p of parts) {
      if (p.type === 'weekday') weekday = p.value
      if (p.type === 'day') day = p.value
      if (p.type === 'month') month = p.value
    }
    if (weekday && day && month) {
      const w = weekday.charAt(0).toUpperCase() + weekday.slice(1)
      return `${w}, ${day} de ${month}`
    }
    return plannedFormatter.format(d)
  } catch {
    return 'Definir data'
  }
}

/** Input type date value yyyy-mm-dd local */
export function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  } catch {
    return ''
  }
}

export function parseDateInputToIso(value: string, endOfDay = false): string {
  const d = new Date(value + (endOfDay ? 'T23:59:59' : 'T12:00:00'))
  return d.toISOString()
}

export function slugifyPreview(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
