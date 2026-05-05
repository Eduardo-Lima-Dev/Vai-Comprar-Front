import clsx from 'clsx'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { LAST_ROOM_SLUG_KEY } from '../constants/storage'

type HamburgerMenuProps = {
  roomSlug?: string
  onArchiveRoom?: () => void
  /** Default: gold hamburger icon. `menu-label` matches mobile mock (“menu”). */
  trigger?: 'icon' | 'menu-label' | 'gear'
}

function MenuRowIcon({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={clsx('flex h-9 w-9 shrink-0 items-center justify-center text-primary', className)}>{children}</span>
}

const icons = {
  home: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 11v9h12v-9" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="9" r="3.25" />
      <path d="M6 20c0-3.314 2.686-6 6-6s6 2.686 6 6" />
    </svg>
  ),
  newRoom: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M12 11v6m-3-3h6" strokeLinecap="round" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1" />
      <path d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1" />
    </svg>
  ),
  room: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 21V10l8-6 8 6v11" />
      <path d="M9 21v-8h6v8" />
    </svg>
  ),
  shopping: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 11h13l-.8 9H9.05L7 14H5m1-9h17l-.7 9H13.7z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 8v4l3 2" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
  archive: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="7" width="16" height="14" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M4 12h16" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10 17H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4" />
      <path d="M14 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 12H9" strokeLinecap="round" />
    </svg>
  ),
}

export function HamburgerMenu({ roomSlug, onArchiveRoom, trigger = 'icon' }: HamburgerMenuProps) {
  const { logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const lastRoomSlug = roomSlug ?? (typeof window !== 'undefined' ? localStorage.getItem(LAST_ROOM_SLUG_KEY) ?? undefined : undefined)

  function closeMenu() {
    setIsOpen(false)
  }

  const itemClass =
    'flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-sans text-sm text-on-surface transition hover:bg-surface-container-high'

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={clsx(
          trigger === 'menu-label'
            ? 'rounded-md px-1 py-1 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-primary underline-offset-4 hover:text-primary-container hover:underline'
            : 'inline-flex h-10 min-w-10 items-center justify-center rounded-lg border bg-surface-container-low/70 text-primary backdrop-blur-sm transition hover:bg-surface-container-high',
        )}
        style={trigger !== 'menu-label' ? { borderColor: 'var(--vc-card-border)' } : undefined}
        aria-label="Abrir menu"
      >
        {trigger === 'menu-label' ? (
          'menu'
        ) : trigger === 'gear' ? (
          <svg viewBox="0 0 24 24" className="h-[1.35rem] w-[1.35rem] fill-none stroke-current" strokeWidth="1.7">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M17.36 6.36l1.42-1.42" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
            <path d="M4 7h16" />
            <path d="M4 12h16" />
            <path d="M4 17h16" />
          </svg>
        )}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50">
          <button type="button" aria-label="Fechar menu" className="absolute inset-0 backdrop-blur-md" style={{ backgroundColor: 'var(--vc-overlay)' }} onClick={closeMenu} />

          <aside
            className="absolute right-0 top-0 flex h-full w-[min(90vw,20rem)] flex-col border-l shadow-2xl"
            style={{ borderColor: 'var(--vc-card-border)', backgroundColor: 'rgba(34,31,26,0.97)' }}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--vc-card-border)' }}>
              <h2 className="font-display text-lg tracking-tight text-on-surface">Menu</h2>
              <button
                type="button"
                onClick={closeMenu}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary transition hover:bg-surface-container-high hover:text-primary-container"
                style={{ border: '1px solid var(--vc-card-border)' }}
                aria-label="Fechar menu"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto p-3">
              <ul className="space-y-1 font-sans text-sm">
                <li>
                  <Link to="/" onClick={closeMenu} className={itemClass}>
                    <MenuRowIcon>{icons.home}</MenuRowIcon>
                    <span>Início</span>
                  </Link>
                </li>
                <li>
                  <Link to="/profile" onClick={closeMenu} className={itemClass}>
                    <MenuRowIcon>{icons.profile}</MenuRowIcon>
                    <span>Perfil</span>
                  </Link>
                </li>
                <li>
                  <Link to="/rooms/new" onClick={closeMenu} className={itemClass}>
                    <MenuRowIcon>{icons.newRoom}</MenuRowIcon>
                    <span>Nova sala</span>
                  </Link>
                </li>
                <li>
                  <Link to="/rooms/access" onClick={closeMenu} className={itemClass}>
                    <MenuRowIcon>{icons.link}</MenuRowIcon>
                    <span>Entrar por URL</span>
                  </Link>
                </li>
                {lastRoomSlug ? (
                  <>
                    <li>
                      <Link to={`/rooms/${lastRoomSlug}`} onClick={closeMenu} className={itemClass}>
                        <MenuRowIcon>{icons.room}</MenuRowIcon>
                        <span>Sala atual</span>
                      </Link>
                    </li>
                    <li>
                      <Link to={`/rooms/${lastRoomSlug}/shopping`} onClick={closeMenu} className={itemClass}>
                        <MenuRowIcon>{icons.shopping}</MenuRowIcon>
                        <span>Compra em andamento</span>
                      </Link>
                    </li>
                    <li>
                      <Link to={`/rooms/${lastRoomSlug}/history`} onClick={closeMenu} className={itemClass}>
                        <MenuRowIcon>{icons.history}</MenuRowIcon>
                        <span>Histórico</span>
                      </Link>
                    </li>
                  </>
                ) : null}
                {onArchiveRoom ? (
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        onArchiveRoom()
                        closeMenu()
                      }}
                      className={clsx(itemClass, 'text-on-surface-variant')}
                    >
                      <MenuRowIcon>{icons.archive}</MenuRowIcon>
                      <span>Arquivar sala</span>
                    </button>
                  </li>
                ) : null}
              </ul>
            </nav>

            <div className="shrink-0 border-t p-3" style={{ borderColor: 'var(--vc-card-border)' }}>
              <button
                type="button"
                onClick={() => {
                  logout()
                  closeMenu()
                }}
                className={clsx(itemClass, 'font-medium text-error hover:bg-surface-container-high')}
              >
                <MenuRowIcon className="text-error">{icons.logout}</MenuRowIcon>
                <span>Sair</span>
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  )
}
