import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { HamburgerMenu } from '../components/HamburgerMenu'
import { PrimaryButton } from '../components/design/PrimaryButton'
import { OutlineGoldButton } from '../components/design/OutlineGoldButton'
import { SurfaceCard } from '../components/design/SurfaceCard'
import { LAST_ROOM_SLUG_KEY } from '../constants/storage'

export function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const displayName = user?.name || user?.email || 'Usuario'
  const lastRoomSlug = typeof window !== 'undefined' ? localStorage.getItem(LAST_ROOM_SLUG_KEY) : null

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
          <h2 className="font-display text-lg text-on-surface">Minha sala</h2>
          {lastRoomSlug ? (
            <div className="mt-4 space-y-4">
              <p className="font-sans text-sm text-on-surface-variant">
                <span className="tracking-label text-[0.68rem] font-semibold uppercase text-primary">Último acesso</span>
                <span
                  className="mt-2 block w-fit rounded-lg bg-surface-container-lowest px-3 py-1.5 font-mono text-[0.8rem] text-on-surface"
                  style={{ border: '1px solid var(--vc-card-border)' }}
                >
                  {lastRoomSlug}
                </span>
              </p>
              <PrimaryButton type="button" className="!normal-case text-base tracking-normal" fullWidth onClick={() => navigate(`/rooms/${lastRoomSlug}`)}>
                Entrar na minha sala
              </PrimaryButton>
            </div>
          ) : (
            <p className="mt-4 font-sans text-sm text-on-surface-variant">Voce ainda nao salvou uma sala nesta sessao.</p>
          )}
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
