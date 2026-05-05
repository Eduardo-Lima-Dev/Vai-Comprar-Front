import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../auth/AuthContext'
import { BrandLogo } from '../components/BrandLogo'
import { IconTextField } from '../components/design/IconTextField'
import { PrimaryButton } from '../components/design/PrimaryButton'
import { SurfaceCard } from '../components/design/SurfaceCard'

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Login realizado com sucesso.')
      navigate('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível autenticar.')
    } finally {
      setLoading(false)
    }
  }

  const envelopeIcon = (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 8l9 7 9-7" />
    </svg>
  )

  const lockIcon = (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 11V8a5 5 0 0 1 10 0v3" />
      <rect x="5" y="11" width="14" height="10" rx="2" />
    </svg>
  )

  return (
    <main className="flex min-h-[100dvh] flex-col px-[var(--spacing-margin-edge)] pb-8">
      <div className="flex w-full flex-1 flex-col items-center justify-center pb-6 pt-[max(2.5rem,min(14vh,7rem))] sm:pb-10 sm:pt-[min(18vh,8.5rem)]">
        <SurfaceCard className="w-full max-w-md" padding="lg">
        <BrandLogo embedded />

        <div className="mb-10 text-center">
          <p className="font-display text-2xl font-medium leading-snug tracking-tight text-on-surface">Organize suas compras em grupo</p>
          <p className="mt-4 font-sans text-sm leading-relaxed text-on-surface-variant">
            Listas compartilhadas para casais e colegas de casa.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <IconTextField
            icon={envelopeIcon}
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <IconTextField
            icon={lockIcon}
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-on-surface-variant transition hover:bg-surface-container-high hover:text-primary"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.8">
                  {showPassword ? (
                    <>
                      <path d="M3 3L21 21" />
                      <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58" />
                      <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8-1 2.83-3.02 5.11-5.62 6.47" />
                      <path d="M6.61 6.61C4.62 8 3.09 9.86 2 12c1.73 4.89 6 8 10 8 1.61 0 3.16-.39 4.56-1.08" />
                    </>
                  ) : (
                    <>
                      <path d="M2 12s3.64-8 10-8 10 8 10 8-3.64 8-10 8-10-8-10-8Z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  )}
                </svg>
              </button>
            }
          />

          <PrimaryButton type="submit" disabled={loading} fullWidth className="uppercase tracking-[0.2em]">
            {loading ? 'Entrando…' : 'Entrar'}
          </PrimaryButton>
        </form>

        <div className="mt-10 text-center">
          <Link to="/register" className="font-sans text-sm font-semibold text-primary underline underline-offset-4 hover:text-primary-container">
            Criar uma conta
          </Link>
        </div>
        </SurfaceCard>
      </div>

      <footer className="shrink-0 px-6 pb-8 pt-4 text-center">
        <p className="font-display text-[0.8rem] italic leading-relaxed text-on-surface-variant">Compras organizadas, casa em sintonia.</p>
      </footer>
    </main>
  )
}
