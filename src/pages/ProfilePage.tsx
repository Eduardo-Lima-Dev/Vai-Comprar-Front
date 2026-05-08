import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as authApi from '../api/auth'
import { useAuth } from '../auth/AuthContext'
import { HamburgerMenu } from '../components/HamburgerMenu'
import { OutlineGoldButton } from '../components/design/OutlineGoldButton'
import { PrimaryButton } from '../components/design/PrimaryButton'
import { SurfaceCard } from '../components/design/SurfaceCard'
import type { User } from '../types/api'

function initialsFromName(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')
}

function formatDate(iso: string | undefined) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso))
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { user: ctxUser, logout, updateUser } = useAuth()
  const [profile, setProfile] = useState<User | null>(ctxUser)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const [isEditing, setIsEditing] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [emailDraft, setEmailDraft] = useState('')
  const [passwordDraft, setPasswordDraft] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [busy, setBusy] = useState(false)

  const name = profile?.name ?? ctxUser?.name ?? 'Usuário'
  const email = profile?.email ?? ctxUser?.email ?? ''

  useEffect(() => {
    authApi.getProfile()
      .then((p) => { setProfile(p); updateUser(p) })
      .catch(() => { /* usa dados do contexto */ })
      .finally(() => setLoadingProfile(false))
  }, [])

  function handleStartEdit() {
    setNameDraft(name)
    setEmailDraft(email)
    setPasswordDraft('')
    setPasswordConfirm('')
    setIsEditing(true)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!nameDraft.trim()) {
      toast.warning('O nome não pode ficar em branco.')
      return
    }
    if (passwordDraft && passwordDraft !== passwordConfirm) {
      toast.warning('As senhas não coincidem.')
      return
    }
    setBusy(true)
    try {
      const input: Parameters<typeof authApi.updateProfile>[0] = {
        name: nameDraft.trim(),
        email: emailDraft.trim(),
      }
      if (passwordDraft) input.password = passwordDraft
      const updated = await authApi.updateProfile(input)
      setProfile(updated)
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

      {/* Avatar */}
      <div className="mb-8 flex flex-col items-center gap-4 py-4">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full border-2 text-2xl font-bold uppercase text-on-background"
          style={{
            borderColor: 'var(--vc-card-border)',
            backgroundImage: 'linear-gradient(135deg,var(--color-surface-container-high),var(--color-surface-container-lowest))',
          }}
        >
          {initialsFromName(name)}
        </div>
        <div className="text-center">
          <p className="font-display text-2xl text-on-background">{name}</p>
          <p className="mt-1 font-sans text-sm text-on-surface-variant">{email || 'Sem e-mail'}</p>
        </div>
      </div>

      {/* Info / Edição */}
      {!isEditing ? (
        <SurfaceCard padding="lg" className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="tracking-label font-sans text-xs font-semibold uppercase text-on-surface-variant">
              Informações da conta
            </p>
            <button
              type="button"
              className="font-sans text-xs font-semibold uppercase text-primary underline-offset-2 hover:underline"
              onClick={handleStartEdit}
            >
              Editar
            </button>
          </div>

          {loadingProfile ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-container-high" />
              ))}
            </div>
          ) : (
            <dl className="space-y-4">
              <div className="flex flex-col gap-1 border-b pb-4" style={{ borderColor: 'var(--vc-card-border)' }}>
                <dt className="font-sans text-[0.7rem] font-semibold uppercase tracking-wider text-on-surface-variant">Nome</dt>
                <dd className="font-sans text-base text-on-background">{name}</dd>
              </div>
              <div className="flex flex-col gap-1 border-b pb-4" style={{ borderColor: 'var(--vc-card-border)' }}>
                <dt className="font-sans text-[0.7rem] font-semibold uppercase tracking-wider text-on-surface-variant">E-mail</dt>
                <dd className="font-sans text-base text-on-background">{email || '—'}</dd>
              </div>
              <div className="flex flex-col gap-1 border-b pb-4" style={{ borderColor: 'var(--vc-card-border)' }}>
                <dt className="font-sans text-[0.7rem] font-semibold uppercase tracking-wider text-on-surface-variant">Membro desde</dt>
                <dd className="font-sans text-base text-on-background">{formatDate(profile?.createdAt)}</dd>
              </div>
              <div className="flex flex-col gap-1 border-b pb-4" style={{ borderColor: 'var(--vc-card-border)' }}>
                <dt className="font-sans text-[0.7rem] font-semibold uppercase tracking-wider text-on-surface-variant">Última atualização</dt>
                <dd className="font-sans text-base text-on-background">{formatDate(profile?.updatedAt)}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="font-sans text-[0.7rem] font-semibold uppercase tracking-wider text-on-surface-variant">ID da conta</dt>
                <dd className="break-all font-mono text-xs text-on-surface-variant">{profile?.id ?? '—'}</dd>
              </div>
            </dl>
          )}
        </SurfaceCard>
      ) : (
        <SurfaceCard padding="lg">
          <p className="tracking-label mb-5 font-sans text-xs font-semibold uppercase text-on-surface-variant">
            Editar informações
          </p>
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

            <div className="border-t pt-4" style={{ borderColor: 'var(--vc-card-border)' }}>
              <p className="tracking-label mb-3 font-sans text-xs font-semibold uppercase text-on-surface-variant">
                Nova senha <span className="normal-case font-normal text-outline">(opcional)</span>
              </p>
              <div className="space-y-3">
                <input
                  id="profile-password"
                  type="password"
                  placeholder="Nova senha"
                  value={passwordDraft}
                  onChange={(e) => setPasswordDraft(e.target.value)}
                  className="placeholder:text-on-surface-variant w-full rounded-lg border bg-surface-container-low px-4 py-3 font-sans text-base text-on-surface outline-none focus:ring-2 focus:ring-primary/35"
                  style={{ borderColor: 'var(--vc-card-border)' }}
                />
                {passwordDraft && (
                  <input
                    type="password"
                    placeholder="Confirmar nova senha"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="placeholder:text-on-surface-variant w-full rounded-lg border bg-surface-container-low px-4 py-3 font-sans text-base text-on-surface outline-none focus:ring-2 focus:ring-primary/35"
                    style={{ borderColor: 'var(--vc-card-border)' }}
                  />
                )}
              </div>
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
        <button
          type="button"
          className="w-full rounded-full border px-6 py-3 font-sans text-sm font-semibold transition hover:opacity-90"
          style={{
            borderColor: 'rgba(220,80,80,0.35)',
            background: 'rgba(180,60,60,0.12)',
            color: '#f08080',
          }}
          onClick={handleLogout}
        >
          Sair da conta
        </button>
      </div>
    </main>
  )
}
