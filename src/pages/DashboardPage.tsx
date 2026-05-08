import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as roomsApi from '../api/rooms'
import { useAuth } from '../auth/AuthContext'
import { HamburgerMenu } from '../components/HamburgerMenu'
import { PrimaryButton } from '../components/design/PrimaryButton'
import { OutlineGoldButton } from '../components/design/OutlineGoldButton'
import { SurfaceCard } from '../components/design/SurfaceCard'
import { roomsCacheKey } from '../constants/storage'
import { formatPlannedDateRaw } from '../lib/format'
import type { Room } from '../types/api'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const displayName = user?.name || user?.email || 'Usuario'

  const [rooms, setRooms] = useState<Room[] | null>(null)

  useEffect(() => {
    if (!user) return

    const cacheKey = roomsCacheKey(user.id)

    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) setRooms(JSON.parse(cached) as Room[])
    } catch { /* ignore */ }

    void roomsApi.listRooms()
      .then((data) => {
        setRooms(data)
        localStorage.setItem(cacheKey, JSON.stringify(data))
      })
      .catch(() => setRooms((prev) => prev ?? []))
  }, [user?.id])

  const activeRooms = rooms?.filter((r) => !r.archivedAt) ?? []
  const archivedRooms = rooms?.filter((r) => Boolean(r.archivedAt)) ?? []

  return (
    <main className="mx-auto w-full max-w-lg px-[var(--spacing-margin-edge)] pb-12 pt-6 md:max-w-xl">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-[1.95rem] font-medium leading-snug tracking-tight text-on-background">Olá,</h1>
          <p className="font-display text-[1.5rem] text-primary">{displayName}</p>
          <p className="mt-3 font-sans text-sm text-on-surface-variant">Suas compras organizadas para o seu lar.</p>
        </div>
        <HamburgerMenu />
      </header>

      <section className="grid gap-6">
        <SurfaceCard>
          <h2 className="font-display text-lg text-on-surface">Minhas salas</h2>

          {rooms === null ? (
            <div className="mt-4 space-y-3">
              <div className="h-20 animate-pulse rounded-xl bg-surface-container-high" />
              <div className="h-20 animate-pulse rounded-xl bg-surface-container-high" />
            </div>
          ) : activeRooms.length === 0 ? (
            <p className="mt-4 font-sans text-sm text-on-surface-variant">
              Você ainda não tem salas. Crie uma ou entre por slug.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {activeRooms.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  className="flex w-full items-start justify-between gap-4 rounded-xl border px-4 py-4 text-left transition hover:bg-surface-container-high"
                  style={{ borderColor: 'var(--vc-card-border)', background: 'rgba(39,37,34,0.78)' }}
                  onClick={() => navigate(`/rooms/${room.slug}`)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-base leading-tight tracking-tight text-on-background">{room.name}</p>
                    <span
                      className="mt-1.5 inline-block rounded-lg bg-surface-container-lowest px-2.5 py-0.5 font-mono text-[0.72rem] text-on-surface-variant"
                      style={{ border: '1px solid var(--vc-card-border)' }}
                    >
                      {room.slug}
                    </span>
                    {room.plannedDate ? (
                      <p className="mt-1 font-sans text-xs text-on-surface-variant">{formatPlannedDateRaw(room.plannedDate)}</p>
                    ) : null}
                  </div>
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-primary" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {archivedRooms.length > 0 ? (
            <div className="mt-6">
              <p className="tracking-label mb-3 font-sans text-[0.68rem] font-semibold uppercase text-on-surface-variant">Arquivadas</p>
              <div className="space-y-2 opacity-50">
                {archivedRooms.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    className="flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left"
                    style={{ borderColor: 'var(--vc-card-border)' }}
                    onClick={() => navigate(`/rooms/${room.slug}`)}
                  >
                    <p className="font-sans text-sm text-on-surface-variant">{room.name}</p>
                    <span className="font-mono text-[0.68rem] text-on-surface-variant">{room.slug}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </SurfaceCard>

        <SurfaceCard padding="lg">
          <h2 className="font-display text-lg text-on-surface">Fluxos rápidos</h2>
          <div className="mt-5 flex flex-col gap-3">
            <PrimaryButton type="button" className="!normal-case text-base tracking-normal" fullWidth onClick={() => navigate('/rooms/new')}>
              Criar sala
            </PrimaryButton>
            <OutlineGoldButton type="button" fullWidth className="!normal-case tracking-normal font-sans font-semibold" onClick={() => navigate('/rooms/access')}>
              Entrar por slug
            </OutlineGoldButton>
          </div>
        </SurfaceCard>
      </section>
    </main>
  )
}
