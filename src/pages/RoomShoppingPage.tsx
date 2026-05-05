import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as itemsApi from '../api/items'
import * as roomsApi from '../api/rooms'
import * as shoppingApi from '../api/shopping'
import { useAuth } from '../auth/AuthContext'
import { HamburgerMenu } from '../components/HamburgerMenu'
import { OutlineGoldButton } from '../components/design/OutlineGoldButton'
import { PrimaryButton } from '../components/design/PrimaryButton'
import { SurfaceCard } from '../components/design/SurfaceCard'
import { LAST_ROOM_SLUG_KEY, shoppingSessionStorageKey } from '../constants/storage'
import type { Item, Room } from '../types/api'

type Phase = 'setup' | 'active' | 'summary'

type PersistedSession = { sessionId: string; participantId: string }

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((token) => token.charAt(0).toUpperCase())
    .join('')
}

export function RoomShoppingPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [room, setRoom] = useState<Room | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [participantId, setParticipantId] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [phase, setPhase] = useState<Phase>('setup')
  const [totalAmount, setTotalAmount] = useState('')
  const [busy, setBusy] = useState(false)

  const participants = room?.participants ?? []
  const responsible = participants.find((p) => p.id === participantId)
  const shopperName = responsible?.name ?? user?.name ?? 'Participante'

  const pending = useMemo(() => items.filter((i) => i.status !== 'PURCHASED'), [items])
  const purchased = useMemo(() => items.filter((i) => i.status === 'PURCHASED'), [items])
  const counted = pending.length + purchased.length
  const progressed = counted === 0 ? 0 : Math.round((purchased.length / counted) * 100)

  function sessKey() {
    return shoppingSessionStorageKey(slug)
  }

  function readStored(): PersistedSession | null {
    if (!slug) return null
    try {
      const raw = sessionStorage.getItem(sessKey())
      if (!raw) return null
      const data = JSON.parse(raw) as PersistedSession
      if (!data?.sessionId || !data.participantId) return null
      return data
    } catch {
      return null
    }
  }

  function writeStored(data: PersistedSession | null) {
    if (!slug) return
    if (!data) sessionStorage.removeItem(sessKey())
    else sessionStorage.setItem(sessKey(), JSON.stringify(data))
  }

  async function loadAll() {
    if (!slug) return
    try {
      const [r, list] = await Promise.all([roomsApi.getRoom(slug), itemsApi.listItems(slug)])
      localStorage.setItem(LAST_ROOM_SLUG_KEY, slug)
      setRoom({ ...r, participants: Array.isArray(r.participants) ? r.participants : [] })
      setItems(Array.isArray(list) ? list : [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar sessão.')
    }
  }

  async function syncItems() {
    if (!slug) return
    try {
      const list = await itemsApi.listItems(slug)
      setItems(Array.isArray(list) ? list : [])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar itens.')
    }
  }

  useEffect(() => {
    void loadAll()
    const saved = readStored()
    if (saved) {
      setSessionId(saved.sessionId)
      setParticipantId(saved.participantId)
      setPhase('active')
    } else {
      setSessionId('')
      setPhase('setup')
    }
  }, [slug])

  async function start(event: FormEvent) {
    event.preventDefault()
    if (!slug || !participantId) {
      toast.warning('Selecione o participante responsável.')
      return
    }
    setBusy(true)
    try {
      const session = await shoppingApi.startShopping(slug, { participantId })
      setSessionId(session.id)
      writeStored({ sessionId: session.id, participantId })
      setPhase('active')
      toast.success('Compra iniciada.')
      await syncItems()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao iniciar.')
    } finally {
      setBusy(false)
    }
  }

  async function toggleItem(id: string, buy: boolean) {
    if (!slug) return
    try {
      await itemsApi.updateItem(slug, id, { status: buy ? 'PURCHASED' : 'PENDING' })
      await syncItems()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar item.')
    }
  }

  function exitFlow() {
    writeStored(null)
    setSessionId('')
    setPhase('setup')
    navigate(`/rooms/${slug}`)
  }

  function cancelActive() {
    if (!sessionId) {
      exitFlow()
      return
    }
    if (!window.confirm('Encerrar esta sessão de compra neste aparelho?')) return
    writeStored(null)
    toast.info('Sessão encerrada localmente.')
    exitFlow()
  }

  async function confirmFinish(event: FormEvent) {
    event.preventDefault()
    if (!slug || !sessionId || !participantId) {
      toast.error('Sessão inválida.')
      return
    }
    const value = Number(String(totalAmount).replace(',', '.').trim())
    if (!Number.isFinite(value) || value <= 0) {
      toast.warning('Informe o valor total (ex.: 184,90).')
      return
    }
    setBusy(true)
    try {
      await shoppingApi.finishShopping(slug, sessionId, { participantId, totalAmount: value })
      writeStored(null)
      toast.success('Compra finalizada.')
      navigate(`/rooms/${slug}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao finalizar.')
    } finally {
      setBusy(false)
    }
  }

  const headerTitle = phase === 'setup' ? 'Preparar compra' : phase === 'active' ? 'Compra em andamento' : 'Finalizar compra'

  return (
    <main className="mx-auto w-full max-w-lg px-[var(--spacing-margin-edge)] pb-48 pt-6 md:max-w-xl">
      <header className="mb-10 flex items-start justify-between gap-3 border-b pb-8" style={{ borderColor: 'var(--vc-card-border)' }}>
        <HamburgerMenu roomSlug={slug} />
        <p className="font-display text-base italic tracking-[0.12em] text-primary">Vai Comprar</p>
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="flex h-10 w-10 items-center justify-center rounded-full border text-[10px] font-semibold uppercase text-on-primary"
          style={{ borderColor: 'var(--vc-card-border)', backgroundImage: 'linear-gradient(140deg,var(--color-primary-container),var(--color-primary))' }}
          aria-label="Perfil"
        >
          {initials(user?.name ?? user?.email ?? 'VC')}
        </button>
      </header>

      <h1 className="font-display text-[1.85rem] text-on-background">{headerTitle}</h1>
      <p className="mt-3 font-sans text-sm text-on-surface-variant">
        {phase === 'setup'
          ? 'Escolha quem fará as compras fisicamente e inicie o fluxo dedicado.'
          : phase === 'active'
            ? 'Marque os itens conforme forem colocados no carrinho.'
            : 'Revise o resumo e confirme o valor total para registrar no histórico.'}
      </p>

      {phase === 'setup' && (
        <SurfaceCard className="mt-10" padding="lg">
          <form onSubmit={start} className="space-y-8">
            <div>
              <label htmlFor="shopper" className="tracking-label text-xs font-semibold uppercase text-primary-container">
                Responsável
              </label>
              <select
                id="shopper"
                required
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                className="mt-4 w-full rounded-xl border bg-surface-container-lowest px-4 py-3 font-sans text-base text-on-surface outline-none focus:ring-2 focus:ring-primary/30"
                style={{ borderColor: 'var(--vc-card-border)' }}
              >
                <option value="">Selecione participante...</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <PrimaryButton type="submit" disabled={busy} fullWidth className="uppercase tracking-[0.18em]">
              Estou indo comprar
            </PrimaryButton>
          </form>
        </SurfaceCard>
      )}

      {(phase === 'active' || phase === 'summary') && (
        <div className="mt-10 space-y-10">
          <SurfaceCard padding="lg">
            <div className="flex flex-wrap gap-5">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[2px] text-primary shadow-inner"
                style={{ borderColor: 'rgb(214 181 109 / .55)', background: 'rgba(0,0,0,0.45)' }}
              >
                <svg viewBox="0 0 40 42" fill="none" className="h-9 w-9" stroke="currentColor" strokeWidth={1.3}>
                  <path d="M10 38h31V15H26V7H17l-5 17H21l2-17" strokeLinejoin="round" />
                  <circle cx="16" cy="40" r="2" />
                  <circle cx="33" cy="40" r="2" />
                </svg>
              </div>
              <div>
                <p className="font-display text-xl text-on-surface">{shopperName} está fazendo as compras</p>
                <p className="mt-3 font-sans text-sm text-on-surface-variant">Previsão de finalização em ~15 min (estimativa local).</p>
              </div>
            </div>
          </SurfaceCard>

          {phase === 'active' && (
            <>
              <div>
                <div className="mb-3 flex items-center justify-between font-sans text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--color-primary-container)' }}>
                  <span>Progresso</span>
                  <span>
                    {purchased.length} de {Math.max(counted, 1)} itens marcados
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full" style={{ background: 'rgb(71 66 61)' }}>
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressed}%`, boxShadow: '0 0 14px rgb(243 209 134 / .45)' }} />
                </div>
              </div>

              <section>
                <h2 className="font-display mb-4 text-lg text-on-background">Pendentes</h2>
                {!pending.length ? (
                  <p className="font-sans text-sm text-outline">Nada pendente no filtro atual.</p>
                ) : (
                  <ul className="space-y-3">
                    {pending.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap gap-4 rounded-xl border px-4 py-3 font-sans"
                        style={{ borderColor: 'var(--vc-card-border)', background: 'rgba(30,26,21,0.78)' }}
                      >
                        <button
                          type="button"
                          className="h-10 w-10 shrink-0 rounded-md border-[2px] border-primary hover:bg-primary/10"
                          aria-label={`Marcar ${item.name} como comprado`}
                          onClick={() => void toggleItem(item.id, true)}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-on-surface">{item.name}</p>
                          <p className="text-sm text-outline">{item.quantity}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section>
                <h2 className="font-display mb-4 text-lg text-on-background">Comprados</h2>
                {!purchased.length ? (
                  <p className="font-sans text-sm text-outline">Nenhum item marcado ainda.</p>
                ) : (
                  <ul className="space-y-3">
                    {purchased.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap gap-4 rounded-xl border px-4 py-3 font-sans opacity-70"
                        style={{ borderColor: 'var(--vc-card-border)', background: 'rgba(30,26,21,0.55)' }}
                      >
                        <button
                          type="button"
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-[2px] border-primary-container bg-primary text-on-primary"
                          aria-label={`Desmarcar ${item.name}`}
                          onClick={() => void toggleItem(item.id, false)}
                        >
                          <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" fill="none" strokeWidth={2.2}>
                            <path d="M20 7 10 17l-5-5" />
                          </svg>
                        </button>
                        <div>
                          <p className="font-medium text-on-surface">{item.name}</p>
                          <p className="text-sm text-outline">{item.quantity}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <div className="grid grid-cols-2 gap-3 pb-28">
                <OutlineGoldButton type="button" className="py-4 !normal-case uppercase" onClick={cancelActive}>
                  Cancelar
                </OutlineGoldButton>
                <PrimaryButton type="button" className="py-4 !normal-case uppercase" disabled={busy} onClick={() => setPhase('summary')}>
                  Finalizar
                </PrimaryButton>
              </div>
            </>
          )}

          {phase === 'summary' && (
            <div className="space-y-8 pb-32">
              <SurfaceCard padding="lg">
                <div className="flex items-center gap-4 border-b pb-5" style={{ borderColor: 'var(--vc-card-border)' }}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border text-primary" style={{ borderColor: 'rgba(243,209,134,0.45)' }}>
                    <svg viewBox="0 0 24 24" className="h-7 w-7" stroke="currentColor" fill="none">
                      <path d="M6 21h13l-.94-17H10.94L10 21" strokeWidth={1.4} />
                      <path d="M14 21V10M10 21V10" strokeWidth={1.4} strokeLinecap="round" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-display text-xl text-on-background">Resumo da compra</p>
                    <p className="font-sans text-xs text-outline">Últimos detalhes antes de confirmar oficialmente este ciclo.</p>
                  </div>
                </div>
                <dl className="mt-8 space-y-4 font-sans text-sm">
                  <div className="flex justify-between">
                    <dt className="text-on-surface-variant">Responsável</dt>
                    <dd className="font-medium text-on-surface">{shopperName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-on-surface-variant">Itens comprados</dt>
                    <dd className="font-medium text-on-surface">{purchased.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-on-surface-variant">Itens pendentes</dt>
                    <dd className="font-semibold text-primary">{pending.length}</dd>
                  </div>
                </dl>
              </SurfaceCard>

              <SurfaceCard padding="lg" className="text-center">
                <p className="tracking-label text-xs font-semibold uppercase text-on-surface-variant">Valor total</p>
                <div className="mt-4 flex items-baseline justify-center gap-2">
                  <span className="font-display text-2xl text-primary">R$</span>
                  <input
                    inputMode="decimal"
                    placeholder="184,90"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="font-display w-40 border-b-2 bg-transparent text-center text-4xl text-on-background outline-none"
                    style={{ borderColor: 'rgba(243,209,134,0.35)' }}
                  />
                </div>
              </SurfaceCard>

              <div
                className="flex flex-wrap gap-4 rounded-2xl border px-4 py-3 font-sans text-sm text-on-surface-variant"
                style={{ borderColor: 'var(--vc-card-border)', background: 'rgba(22,19,18,0.65)' }}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold text-primary" style={{ borderColor: 'rgba(243,209,134,0.35)' }}>
                  i
                </span>
                <p>Após finalizar, os itens comprados podem voltar para pendente no próximo ciclo da lista, conforme regras da sua equipe.</p>
              </div>

              <form onSubmit={confirmFinish} className="space-y-4">
                <PrimaryButton type="submit" disabled={busy} fullWidth className="py-4 !normal-case">
                  <span className="flex items-center justify-center gap-3">
                    Confirmar finalização
                    <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" fill="none" strokeWidth={2}>
                      <path d="M20 7 10 17l-5-5" />
                    </svg>
                  </span>
                </PrimaryButton>
                <button type="button" className="w-full font-sans text-sm text-on-surface-variant underline-offset-4 hover:underline" onClick={() => setPhase('active')}>
                  Voltar para compra
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
