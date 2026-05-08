import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as authApi from '../api/auth'
import { useAuth } from '../auth/AuthContext'
import { HamburgerMenu } from '../components/HamburgerMenu'
import { OutlineGoldButton } from '../components/design/OutlineGoldButton'
import { PrimaryButton } from '../components/design/PrimaryButton'
import { SurfaceCard } from '../components/design/SurfaceCard'

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [emailDraft, setEmailDraft] = useState('')
  const [busy, setBusy] = useState(false)

  const name = user?.name ?? 'Usuário'
  const email = user?.email ?? ''
  const initials = initialsFromName(name)

  function handleStartEdit() {
    setNameDraft(name)
    setEmailDraft(email)
    setIsEditing(true)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!nameDraft.trim()) {
      toast.warning('O nome não pode ficar em branco.')
      return
    }
    setBusy(true)
    try {
      const updated = await authApi.updateProfile({
        name: nameDraft.trim(),
        email: emailDraft.trim(),
      })
      updateUser(updated)
      setIsEditing(false)
      toast.success('Perfil atualizado.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar perfil.')
    } finally {
      setBusy(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <main className="mx-auto w-full max-w-lg px-[var(--spacing-margin-edge)] pb-8 pt-6 md:max-w-xl">
      <header className="mb-8 flex items-start justify-between">
        <h1 className="font-display text-[1.65rem] font-medium leading-tight text-on-background">Perfil</h1>
        <HamburgerMenu />
      </header>

      {/* Avatar + nome */}
      <div className="mb-8 flex flex-col items-center gap-4 py-4">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full border-2 text-2xl font-bold uppercase text-on-background"
          style={{
            borderColor: 'var(--vc-card-border)',
            backgroundImage: 'linear-gradient(135deg,var(--color-surface-container-high),var(--color-surface-container-lowest))',
          }}
        >
          {initials}
        </div>
        <div className="text-center">
          <p className="font-display text-2xl text-on-background">{name}</p>
          <p className="mt-1 font-sans text-sm text-on-surface-variant">{email || 'Sem e-mail'}</p>
        </div>
      </div>

      {/* Informações */}
      {!isEditing ? (
        <SurfaceCard padding="lg" className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="tracking-label font-sans text-xs font-semibold uppercase text-on-surface-variant">Informações da conta</p>
            <button
              type="button"
              className="font-sans text-xs font-semibold uppercase text-primary underline-offset-2 hover:underline"
              onClick={handleStartEdit}
            >
              Editar
            </button>
          </div>

          <dl className="space-y-4">
            <div className="flex flex-col gap-1 border-b pb-4" style={{ borderColor: 'var(--vc-card-border)' }}>
              <dt className="font-sans text-[0.7rem] font-semibold uppercase tracking-wider text-on-surface-variant">Nome</dt>
              <dd className="font-sans text-base text-on-background">{name}</dd>
            </div>
            <div className="flex flex-col gap-1 border-b pb-4" style={{ borderColor: 'var(--vc-card-border)' }}>
              <dt className="font-sans text-[0.7rem] font-semibold uppercase tracking-wider text-on-surface-variant">E-mail</dt>
              <dd className="font-sans text-base text-on-background">{email || '—'}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="font-sans text-[0.7rem] font-semibold uppercase tracking-wider text-on-surface-variant">ID da conta</dt>
              <dd className="break-all font-mono text-xs text-on-surface-variant">{user?.id ?? '—'}</dd>
            </div>
          </dl>
        </SurfaceCard>
      ) : (
        <SurfaceCard padding="lg">
          <p className="tracking-label mb-5 font-sans text-xs font-semibold uppercase text-on-surface-variant">Editar informações</p>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="profile-name" className="font-sans text-[0.7rem] font-semibold uppercase tracking-wider text-on-surface-variant">
                Nome
              </label>
              <input
                id="profile-name"
                type="text"
                required
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                className="placeholder:text-on-surface-variant w-full rounded-lg border bg-surface-container-low px-4 py-3 font-sans text-base text-on-surface outline-none focus:ring-2 focus:ring-primary/35"
                style={{ borderColor: 'var(--vc-card-border)' }}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="profile-email" className="font-sans text-[0.7rem] font-semibold uppercase tracking-wider text-on-surface-variant">
                E-mail
              </label>
              <input
                id="profile-email"
                type="email"
                required
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                className="placeholder:text-on-surface-variant w-full rounded-lg border bg-surface-container-low px-4 py-3 font-sans text-base text-on-surface outline-none focus:ring-2 focus:ring-primary/35"
                style={{ borderColor: 'var(--vc-card-border)' }}
              />
            </div>
            <div className="flex flex-col gap-3 pt-2">
              <PrimaryButton type="submit" disabled={busy} fullWidth className="!normal-case">
                {busy ? 'Salvando…' : 'Salvar alterações'}
              </PrimaryButton>
              <button
                type="button"
                disabled={busy}
                className="font-sans text-sm text-on-surface-variant underline-offset-2 hover:underline"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </SurfaceCard>
      )}

      {/* Ações */}
      <div className="mt-6 flex flex-col gap-3">
        <OutlineGoldButton type="button" onClick={() => navigate('/')}>
          Ir para Home
        </OutlineGoldButton>
        <PrimaryButton
          type="button"
          className="!normal-case !text-base font-semibold"
          onClick={handleLogout}
          style={{ background: 'rgba(180,60,60,0.18)', borderColor: 'rgba(220,80,80,0.35)', color: '#f08080' }}
        >
          Sair da conta
        </PrimaryButton>
      </div>
    </main>
  )
}
