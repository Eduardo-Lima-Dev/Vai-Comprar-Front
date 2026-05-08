import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as roomsApi from '../api/rooms'
import { HamburgerMenu } from '../components/HamburgerMenu'
import { OutlineGoldButton } from '../components/design/OutlineGoldButton'
import { PrimaryButton } from '../components/design/PrimaryButton'
import { SurfaceCard } from '../components/design/SurfaceCard'

export function AccessRoomPage() {
  const navigate = useNavigate()
  const [slug, setSlug] = useState('')
  const [loading, setLoading] = useState(false)

  function normalizeRoomInput(raw: string): string {
    const input = raw.trim()
    if (!input) return ''

    // Se vier URL completa, extrai apenas o pathname.
    let candidate = input
    try {
      const maybeUrl = new URL(input)
      candidate = maybeUrl.pathname
    } catch {
      // Não era URL completa; segue como slug/path cru.
    }

    candidate = candidate.replace(/^\/+|\/+$/g, '')
    candidate = candidate.replace(/^rooms\/?/i, '').replace(/^sala\/?/i, '')

    // Aceita só o primeiro segmento final como slug.
    const firstSegment = candidate.split('/')[0] ?? ''
    return firstSegment.trim()
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const normalized = normalizeRoomInput(slug)
    if (!normalized) return
    setLoading(true)
    try {
      await roomsApi.getRoom(normalized)
      void roomsApi.touchRoom(normalized).catch(() => null)
      navigate(`/rooms/${normalized}`)
    } catch {
      toast.error('Slug ou link inválido (ou sem acesso para esta conta).')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto min-h-[70vh] w-full max-w-lg px-[var(--spacing-margin-edge)] pb-12 pt-6 md:max-w-xl">
      <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.75rem] tracking-tight text-on-background">Entrar por slug</h1>
          <p className="mt-2 font-sans text-sm text-on-surface-variant">Cole o identificador ou o link da sala.</p>
        </div>
        <HamburgerMenu />
      </header>

      <SurfaceCard padding="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="room-slug" className="tracking-label mb-2 block font-sans text-xs font-semibold uppercase text-primary">
              Slug ou URL da sala
            </label>
            <input
              id="room-slug"
              className="font-sans w-full rounded-xl border bg-surface-container-lowest px-4 py-3 text-on-surface outline-none ring-primary/35 transition focus:border-primary-container focus:ring-2 placeholder:text-on-surface-variant"
              style={{ borderColor: 'var(--vc-card-border)' }}
              placeholder="casa302 ou link completo"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <PrimaryButton type="submit" className="!normal-case sm:flex-1" fullWidth disabled={loading}>
              {loading ? 'Validando…' : 'Entrar'}
            </PrimaryButton>
            <OutlineGoldButton type="button" fullWidth className="!normal-case font-sans sm:flex-1" onClick={() => navigate('/')}>
              Voltar
            </OutlineGoldButton>
          </div>
        </form>
      </SurfaceCard>
    </main>
  )
}
