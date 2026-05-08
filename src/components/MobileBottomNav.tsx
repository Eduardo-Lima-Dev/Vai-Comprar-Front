import clsx from 'clsx'
import type { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../auth/AuthContext'
import { roomsCacheKey } from '../constants/storage'
import type { Room } from '../types/api'

type TabId = 'home' | 'rooms' | 'activity' | 'profile'

function NavIconHome({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={clsx('h-6 w-6', active ? 'text-primary' : 'text-on-surface-variant')} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 11v9h12v-9" />
    </svg>
  )
}

function NavIconRooms({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={clsx('h-6 w-6', active ? 'text-primary' : 'text-on-surface-variant')} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21V12h6v9" />
    </svg>
  )
}

function NavIconActivity({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={clsx('h-6 w-6', active ? 'text-primary' : 'text-on-surface-variant')} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 8v9" />
      <path d="M8 22h8" />
      <path d="M8 4h8l1 12H7L8 4z" />
    </svg>
  )
}

function NavIconProfile({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={clsx('h-6 w-6', active ? 'text-primary' : 'text-on-surface-variant')} fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="9" r="3.25" />
      <path d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" />
    </svg>
  )
}

function isRoomsLikePath(pathname: string): boolean {
  if (pathname === '/rooms/new' || pathname === '/rooms/access') return true
  const match = /^\/rooms\/([^/]+)/.exec(pathname)
  if (!match?.[1]) return false
  return !pathname.includes('/history')
}

function isActivityPath(pathname: string): boolean {
  return pathname.includes('/history')
}

export function MobileBottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()

  const tabActive = (tab: TabId): boolean => {
    if (tab === 'home') return pathname === '/'
    if (tab === 'profile') return pathname === '/profile'
    if (tab === 'activity') return isActivityPath(pathname)
    if (tab === 'rooms') return isRoomsLikePath(pathname)
    return false
  }

  function getCurrentSlug(): string | null {
    const match = /^\/rooms\/([^/]+)/.exec(pathname)
    const slug = match?.[1]
    if (!slug || slug === 'new' || slug === 'access') return null
    return slug
  }

  function getMostRecentSlug(): string | null {
    if (!user) return null
    try {
      const cached = localStorage.getItem(roomsCacheKey(user.id))
      if (!cached) return null
      const rooms = JSON.parse(cached) as Room[]
      return rooms.find((r) => !r.archivedAt)?.slug ?? null
    } catch {
      return null
    }
  }

  function handleRooms() {
    const slug = getCurrentSlug() ?? getMostRecentSlug()
    if (slug) {
      navigate(`/rooms/${slug}`)
      return
    }
    navigate('/')
  }

  function handleActivity() {
    const slug = getCurrentSlug() ?? getMostRecentSlug()
    if (slug) {
      navigate(`/rooms/${slug}/history`)
      return
    }
    toast.info('Abra uma sala para ver o histórico.')
    navigate('/')
  }

  const items: { id: TabId; label: string; icon: (a: boolean) => ReactNode; onClick: () => void }[] = [
    { id: 'home', label: 'Início', icon: (a) => <NavIconHome active={a} />, onClick: () => navigate('/') },
    { id: 'rooms', label: 'Salas', icon: (a) => <NavIconRooms active={a} />, onClick: handleRooms },
    { id: 'activity', label: 'Atividade', icon: (a) => <NavIconActivity active={a} />, onClick: handleActivity },
    { id: 'profile', label: 'Perfil', icon: (a) => <NavIconProfile active={a} />, onClick: () => navigate('/profile') },
  ]

  return (
    <nav
      className={clsx(
        'fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant bg-surface-container-low/95 backdrop-blur-md',
        'pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2',
      )}
      style={{ borderColor: 'var(--vc-card-border)' }}
      aria-label="Navegação principal"
    >
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2">
        {items.map(({ id, label, icon, onClick }) => {
          const active = tabActive(id)
          return (
            <button key={id} type="button" onClick={onClick} className={clsx('flex flex-col items-center gap-1 rounded-lg py-2 transition', active && 'bg-surface-container-high/80')}>
              {icon(active)}
              <span className={clsx('font-sans text-[11px] font-semibold', active ? 'text-primary' : 'text-on-surface-variant')}>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
