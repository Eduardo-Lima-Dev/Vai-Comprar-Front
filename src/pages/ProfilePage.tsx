import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { HamburgerMenu } from '../components/HamburgerMenu'
import { OutlineGoldButton } from '../components/design/OutlineGoldButton'
import { PrimaryButton } from '../components/design/PrimaryButton'
import { SurfaceCard } from '../components/design/SurfaceCard'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const name = user?.name ?? 'Usuário'
  const email = user?.email ?? ''

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="mx-auto w-full max-w-lg px-[var(--spacing-margin-edge)] pb-8 pt-6 md:max-w-xl">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[1.65rem] font-medium leading-tight text-on-background">Perfil</h1>
          <p className="mt-2 font-sans text-sm leading-relaxed text-on-surface-variant">Sua conta no Vai Comprar.</p>
        </div>
        <HamburgerMenu />
      </header>

      <SurfaceCard>
        <p className="tracking-label mb-2 font-sans text-xs font-semibold uppercase text-primary">{name}</p>
        <p className="font-sans text-base text-on-surface">{email || 'Sem e-mail'}</p>
        <div className="mt-6 flex flex-col gap-3">
          <OutlineGoldButton type="button" onClick={() => navigate('/')}>
            Ir para Home
          </OutlineGoldButton>
          <PrimaryButton type="button" className="!normal-case !text-base font-semibold" onClick={handleLogout}>
            Sair da conta
          </PrimaryButton>
        </div>
      </SurfaceCard>
    </main>
  )
}
