import { useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as roomsApi from '../api/rooms'
import { PrimaryButton } from '../components/design/PrimaryButton'
import { SurfaceCard } from '../components/design/SurfaceCard'
import { UnderlineField } from '../components/design/UnderlineField'
import { LAST_ROOM_SLUG_KEY } from '../constants/storage'
import { formatPlannedDateRaw, parseDateInputToIso, slugifyPreview } from '../lib/format'

const todayInput = (): string => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function CreateRoomPage() {
  const navigate = useNavigate()
  const nativeDateRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('Casa 302')
  const [plannedDateInput, setPlannedDateInput] = useState(todayInput)
  const [loading, setLoading] = useState(false)

  const slugPreview = useMemo(() => slugifyPreview(name) || 'sua-sala', [name])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    try {
      const iso = plannedDateInput ? parseDateInputToIso(plannedDateInput) : new Date().toISOString()
      const room = await roomsApi.createRoom({
        name: name.trim(),
        plannedDate: iso,
      })
      localStorage.setItem(LAST_ROOM_SLUG_KEY, room.slug)
      const roomPath = `/rooms/${room.slug}`
      const roomUrl = `${window.location.origin}${roomPath}`
      try {
        await navigator.clipboard?.writeText(roomUrl)
        toast.success(`Sala criada: ${room.slug}. Link copiado!`)
      } catch {
        toast.success(`Sala criada: ${room.slug}`)
      }
      navigate(`/rooms/${room.slug}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Nao foi possivel criar a sala.')
    } finally {
      setLoading(false)
    }
  }

  const calendarIcon = (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M8 3.5v4M16 3.5v4M4 11h16" />
    </svg>
  )

  const displayPlannedLabel = plannedDateInput ? formatPlannedDateRaw(parseDateInputToIso(plannedDateInput)) : 'Definir data'

  return (
    <main className="mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-lg flex-col px-[var(--spacing-margin-edge)] pb-32 pt-6 md:max-w-xl">
      <header className="mb-6 flex items-start gap-3">
        <Link to="/" className="mt-1 shrink-0 text-primary hover:text-primary-container" aria-label="Voltar">
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="2">
            <path d="M14 18 8 12l6-6" />
          </svg>
        </Link>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="font-display text-[1.6rem] font-medium tracking-tight text-on-background">Nova sala</h1>
          <p className="mx-auto mt-2 max-w-xs px-4 font-sans text-sm leading-relaxed text-on-surface-variant">
            Crie uma lista compartilhada para sua casa
          </p>
        </div>
        <span className="shrink-0 w-8" aria-hidden />
      </header>

      <SurfaceCard className="mt-2 flex-1 pb-8" padding="lg">
        <h2 className="font-display text-lg text-on-surface">Detalhes da sala</h2>

        <form id="create-room-form" onSubmit={handleSubmit} className="mt-8 space-y-8">
          <UnderlineField label="Nome da sala" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" required />

          <div>
            <div className="flex items-start justify-between gap-2 border-b border-outline-variant pb-2">
              <div className="min-w-0 flex-1">
                <label htmlFor="planned-date-visible" className="tracking-label mb-2 block font-sans text-xs font-semibold uppercase text-on-surface-variant">
                  Data prevista
                </label>
                <span id="planned-date-visible" className="font-display block text-lg font-medium tracking-tight text-on-surface">
                  {displayPlannedLabel}
                </span>
              </div>
              <input
                ref={nativeDateRef}
                type="date"
                className="sr-only"
                value={plannedDateInput}
                onChange={(e) => setPlannedDateInput(e.target.value)}
              />
              <button
                type="button"
                aria-label="Abrir seletor de data"
                className="mt-7 rounded-lg p-2 text-primary transition hover:bg-primary/10"
                onClick={() => {
                  nativeDateRef.current?.showPicker?.()
                  nativeDateRef.current?.focus?.()
                  nativeDateRef.current?.click?.()
                }}
              >
                {calendarIcon}
              </button>
            </div>
          </div>

          <div
            className="flex flex-wrap items-center justify-between gap-3 rounded-full border px-5 py-3"
            style={{ borderColor: 'var(--vc-card-border)', background: 'rgba(16,14,9,0.55)' }}
          >
            <p className="min-w-0 break-all font-sans text-[0.8rem] tracking-tight text-primary sm:text-sm">
              Prévia: /rooms/<strong className="font-semibold">{slugPreview}</strong>
            </p>
            <span className="font-sans text-[0.72rem] text-on-surface-variant">Link final ao criar sala</span>
          </div>

          <section>
            <p className="tracking-label mb-3 font-sans text-xs font-semibold uppercase text-on-surface-variant">Convites</p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex -space-x-3">
                <div
                  className="h-11 w-11 rounded-full border-2 border-background"
                  style={{ backgroundImage: 'linear-gradient(140deg,#3c3933,#1e1b16)', backgroundSize: 'cover' }}
                  aria-hidden
                />
                <div
                  className="h-11 w-11 rounded-full border-2 border-background"
                  style={{ backgroundImage: 'linear-gradient(-40deg,#2d2822,#473e33)', backgroundSize: 'cover' }}
                  aria-hidden
                />
                <button
                  type="button"
                  aria-label="Adicionar convidado quando disponível"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-primary text-xl font-semibold text-primary opacity-65"
                  disabled
                >
                  +
                </button>
              </div>
              <p className="flex-1 font-sans text-sm text-on-surface-variant">Convide pessoas depois da sala ficar disponível para convites ao vivo.</p>
            </div>
          </section>
        </form>
      </SurfaceCard>

      <div className="fixed inset-x-0 bottom-[5.75rem] z-30 px-[var(--spacing-margin-edge)] pb-2 pt-3">
        <PrimaryButton form="create-room-form" type="submit" disabled={loading} fullWidth className="py-4 text-lg font-semibold !normal-case shadow-xl">
          {loading ? 'Criando sala…' : 'Criar sala'}
        </PrimaryButton>
      </div>
    </main>
  )
}
