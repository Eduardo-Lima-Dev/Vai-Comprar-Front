import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as itemsApi from '../api/items'
import * as participantsApi from '../api/participants'
import * as roomsApi from '../api/rooms'
import { useAuth } from '../auth/AuthContext'
import { HamburgerMenu } from '../components/HamburgerMenu'
import { Chip } from '../components/design/Chip'
import { OutlineGoldButton } from '../components/design/OutlineGoldButton'
import { PrimaryButton } from '../components/design/PrimaryButton'
import { SurfaceCard } from '../components/design/SurfaceCard'
import { LAST_ROOM_SLUG_KEY } from '../constants/storage'
import { CATEGORY_LABELS, ROOM_FILTER_CATEGORIES } from '../lib/categories'
import { formatPlannedDateRaw, parseDateInputToIso, toDateInputValue } from '../lib/format'
import type { Item, ItemCategory, ItemStatus, Participant, Room } from '../types/api'

type RoomState = {
  room: Room | null
  items: Item[]
}

function initialsFromName(name: string, maxLetters = 2) {
  return name
    .split(/\s+/)
    .slice(0, maxLetters)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')
}

const tagByCategory: Record<ItemCategory, string> = {
  COMIDA: 'Despensa',
  LIMPEZA: 'Limpeza',
  HIGIENE: 'Higiene',
  BEBIDAS: 'Bebidas',
  DIA_A_DIA: 'Dia a dia',
  OUTROS: 'Essencial',
}

function categoryGlyph(category: ItemCategory) {
  switch (category) {
    case 'COMIDA':
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" stroke="currentColor" fill="none" strokeWidth={1.4}>
          <path d="M5 21h13M7 21V13h6v8m-9 8V17h13v4m-13-11V7h13v10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'BEBIDAS':
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" stroke="currentColor" fill="none" strokeWidth={1.4}>
          <path d="M11 21V14M9 21h6m-10-14h14l-.7 14H12.7z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'LIMPEZA':
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" stroke="currentColor" fill="none" strokeWidth={1.4}>
          <path d="M17 21H7v-9l10-11v15Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" stroke="currentColor" fill="none" strokeWidth={1.4}>
          <rect x="5" y="5" width="14" height="14" rx="2" />
        </svg>
      )
  }
}

export function RoomPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [state, setState] = useState<RoomState>({ room: null, items: [] })
  const [newParticipantName, setNewParticipantName] = useState('')
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<ItemCategory | null>('COMIDA')
  const [isDateSheetOpen, setIsDateSheetOpen] = useState(false)
  const [plannedDraft, setPlannedDraft] = useState('')
  const nativeDateModalRef = useRef<HTMLInputElement>(null)

  const pendingItems = useMemo(() => state.items.filter((item) => item.status !== 'PURCHASED'), [state.items])
  const purchasedItems = useMemo(() => state.items.filter((item) => item.status === 'PURCHASED'), [state.items])
  const participants: Participant[] = state.room?.participants ?? []

  function getErrorMessage(err: unknown, fallback: string) {
    return err instanceof Error ? err.message : fallback
  }

  async function loadRoomData(notify = false) {
    if (!slug) return
    try {
      const [room, items] = await Promise.all([roomsApi.getRoom(slug), itemsApi.listItems(slug)])
      localStorage.setItem(LAST_ROOM_SLUG_KEY, slug)
      setState({
        room: { ...room, participants: Array.isArray(room.participants) ? room.participants : [] },
        items: Array.isArray(items) ? items : [],
      })
      if (notify) toast.success('Sala carregada com sucesso.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar sala.'))
    }
  }

  useEffect(() => {
    void loadRoomData(true)
    const interval = setInterval(() => void loadRoomData(false), 10000)
    return () => clearInterval(interval)
  }, [slug])

  useEffect(() => {
    if (isDateSheetOpen) {
      setPlannedDraft(toDateInputValue(state.room?.plannedDate) || '')
    }
  }, [isDateSheetOpen, state.room?.plannedDate])

  async function handleArchiveRoom() {
    if (!slug) return
    try {
      await roomsApi.archiveRoom(slug)
      toast.success('Sala arquivada.')
      await loadRoomData()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao arquivar sala.'))
    }
  }

  async function handleSavePlanned(event: FormEvent) {
    event.preventDefault()
    if (!slug || !plannedDraft) {
      toast.warning('Informe uma data válida antes de confirmar.')
      return
    }
    try {
      const iso = parseDateInputToIso(plannedDraft, true)
      await roomsApi.updateRoom(slug, { plannedDate: iso })
      toast.success('Data atualizada.')
      setIsDateSheetOpen(false)
      await loadRoomData()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao salvar data.'))
    }
  }

  async function handleUpdateItemStatus(itemId: string, status: ItemStatus) {
    if (!slug) return
    try {
      await itemsApi.updateItem(slug, itemId, { status })
      await loadRoomData()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao atualizar item.'))
    }
  }

  async function handleDeleteItem(itemId: string) {
    if (!slug) return
    if (!window.confirm('Tem certeza que deseja remover este item?')) return
    try {
      await itemsApi.deleteItem(slug, itemId)
      toast.success('Item removido com sucesso.')
      await loadRoomData()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao remover item.'))
    }
  }

  async function handleAddParticipant(event: FormEvent) {
    event.preventDefault()
    if (!slug) return
    try {
      await participantsApi.addParticipant(slug, { name: newParticipantName })
      setNewParticipantName('')
      toast.success('Participante adicionado.')
      await loadRoomData()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao adicionar participante.'))
    }
  }

  async function handleRemoveParticipant(participantId: string) {
    if (!slug) return
    try {
      await participantsApi.removeParticipant(slug, participantId)
      toast.success('Participante removido.')
      await loadRoomData()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao remover participante.'))
    }
  }

  const avatarInitial = useMemo(() => {
    const base = user?.name || user?.email || ''
    const letters = initialsFromName(base.trim() ? base : '?', 2)
    return letters || '?'
  }, [user?.email, user?.name])

  const filteredPending = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return pendingItems.filter((item) => {
      const catOk = !filterCategory || item.category === filterCategory
      if (!needle) return catOk
      const hay = `${item.name} ${item.quantity}`.toLowerCase()
      return catOk && hay.includes(needle)
    })
  }, [pendingItems, filterCategory, search])

  const participantRing = participants.slice(0, 6)

  const displayPlannedFormatted = plannedDraft ? formatPlannedDateRaw(parseDateInputToIso(plannedDraft)) : ''

  return (
    <main className="mx-auto w-full max-w-lg px-[var(--spacing-margin-edge)] pb-[13rem] pt-6 md:max-w-xl">
      {/* Top chrome */}
      <header className="mb-10 flex flex-col gap-10">
        <div className="flex items-start justify-between gap-3">
          <HamburgerMenu trigger="menu-label" roomSlug={slug} onArchiveRoom={handleArchiveRoom} />
          <p className="font-display mt-2 text-xl italic tracking-[0.14em] text-primary">Vai Comprar</p>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold uppercase text-on-primary"
            style={{
              borderColor: 'var(--vc-card-border)',
              backgroundImage: 'linear-gradient(140deg,var(--color-primary-container),var(--color-primary))',
            }}
            aria-label="Abrir perfil"
          >
            {avatarInitial.slice(0, 2).toUpperCase()}
          </button>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-10" style={{ borderColor: 'var(--vc-card-border)' }}>
          <div>
            <h1 className="font-display text-[2rem] tracking-tight text-on-background">{state.room?.name ? state.room.name : `Sala ${slug}`}</h1>
            <p className="mt-2 font-sans text-sm text-on-surface-variant">Lista compartilhada</p>
          </div>
        </div>

        {/* Participants */}
        <div className="-mt-8 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex -space-x-3">
              {participantRing.map((p) => (
                <div
                  key={p.id}
                  title={p.name}
                  aria-label={p.name}
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-background text-[11px] font-semibold uppercase text-on-background"
                  style={{
                    borderColor: 'var(--vc-card-border)',
                    backgroundImage: 'linear-gradient(135deg,var(--color-surface-container-high),var(--color-surface-container-lowest))',
                  }}
                >
                  {initialsFromName(p.name)}
                </div>
              ))}
            </div>
            <div className="min-w-[10rem]">
              <p className="tracking-label mb-2 font-sans text-[0.7rem] font-semibold uppercase text-on-surface-variant">
                Lista sincronizada • {participants.length} participantes
              </p>
              <span
                className="inline-flex items-center gap-3 rounded-full border px-5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em]"
                style={{
                  borderColor: 'rgba(171,157,237,0.45)',
                  backgroundColor: 'rgba(43,41,71,0.55)',
                  color: '#eae5ff',
                }}
              >
                <span className="relative inline-flex h-2 w-2">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-[#b49cff]" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c5b9ff]" />
                </span>
                tempo real
              </span>
            </div>
          </div>
        </div>
      </header>

      <section className="space-y-8">
        <SurfaceCard padding="lg" className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="tracking-label mb-3 font-sans text-xs font-semibold text-primary-container">PRÓXIMA COMPRA</p>
            <p className="font-display max-w-[15rem] text-2xl text-on-surface">{formatPlannedDateRaw(state.room?.plannedDate)}</p>
          </div>
          <OutlineGoldButton type="button" className="!normal-case px-8 py-4 text-[0.7rem]" onClick={() => setIsDateSheetOpen(true)}>
            Editar data
          </OutlineGoldButton>
        </SurfaceCard>

        <div
          className="relative rounded-full border px-11 py-3 shadow-inner transition focus-within:ring-2 focus-within:ring-primary/35"
          style={{ borderColor: 'var(--vc-card-border)', background: '#100e09' }}
        >
          <span className="absolute left-4 top-1/2 inline-flex -translate-y-1/2 text-primary" aria-hidden>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11.5" cy="11.5" r="6.5" />
              <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
            </svg>
          </span>
          <input
            aria-label="Buscar item na lista"
            placeholder="Buscar item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="placeholder:text-outline font-sans w-full border-none bg-transparent text-base text-on-surface outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Chip lowercase type="button" active={filterCategory === null} onClick={() => setFilterCategory(null)}>
            Todas
          </Chip>
          {ROOM_FILTER_CATEGORIES.map((category) => (
            <Chip key={category} type="button" lowercase active={filterCategory === category} onClick={() => setFilterCategory(category)}>
              {CATEGORY_LABELS[category]}
            </Chip>
          ))}
        </div>

        {/* Pending list */}
        <div className="space-y-4">
          <h2 className="font-display text-lg text-on-background">Pendentes</h2>

          {!filteredPending.length ? (
            <SurfaceCard padding="lg" className="text-center font-sans text-sm text-on-surface-variant">
              Nenhum item corresponde a este filtro ainda.
            </SurfaceCard>
          ) : null}

          {filteredPending.map((item) => (
            <article key={item.id} className="flex gap-5 rounded-xl border px-5 py-4 shadow-xl" style={{ borderColor: 'var(--vc-card-border)', background: 'rgba(39,37,34,0.78)' }}>
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border bg-surface-container-lowest text-primary"
                style={{ borderColor: 'var(--vc-card-border)' }}
              >
                {categoryGlyph(item.category)}
              </div>
              <div className="min-w-0 flex-1">
                <span
                  className="float-end ml-4 mb-4 inline-flex rounded-[0.375rem] border px-4 py-[0.18rem] text-[11px] font-semibold uppercase tracking-[0.2em] text-primary"
                  style={{ borderColor: 'var(--vc-card-border)' }}
                >
                  {tagByCategory[item.category]}
                </span>
                <p className="font-display text-xl text-on-background">{item.name}</p>
                <p className="mt-2 font-sans text-sm text-on-surface-variant">{item.quantity}</p>
              </div>
              <div className="flex flex-col items-center gap-4 self-start">
                <button
                  type="button"
                  aria-pressed={item.status === 'PURCHASED'}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition ${
                    item.status === 'PURCHASED'
                      ? 'border-primary-container bg-primary text-on-primary shadow-[0_0_33px_-6px_rgb(243_209_134/.45)]'
                      : 'border-primary-container bg-transparent text-primary hover:bg-primary/10'
                  }`}
                  onClick={() => handleUpdateItemStatus(item.id, item.status === 'PURCHASED' ? 'PENDING' : 'PURCHASED')}
                >
                  {item.status === 'PURCHASED' ? (
                    <svg viewBox="0 0 24 24" className="h-6 w-6" stroke="currentColor" fill="none" strokeWidth={2.4}>
                      <path d="M20 7 10 17l-5-5" />
                    </svg>
                  ) : null}
                </button>
                <button
                  type="button"
                  aria-label={`Remover ${item.name}`}
                  className="text-on-surface-variant transition hover:text-error"
                  onClick={() => void handleDeleteItem(item.id)}
                >
                  <svg viewBox="0 0 24 24" className="mx-auto h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M9 11V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5 9h14l-.9 13H9.92L9 17h8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M11 21h2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>

        {purchasedItems.length ? (
          <SurfaceCard padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-on-background">Comprados neste ciclo</h2>
              <span className="font-sans text-xs text-primary">{purchasedItems.length}</span>
            </div>
            <ul className="space-y-2 font-sans text-sm text-on-surface-variant">
              {purchasedItems.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center gap-4 border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: 'var(--vc-card-border)' }}>
                  <button
                    type="button"
                    className="rounded-full bg-primary px-5 py-1 text-[11px] font-semibold uppercase text-on-primary"
                    onClick={() => handleUpdateItemStatus(item.id, 'PENDING')}
                  >
                    Reabrir
                  </button>
                  <div className="flex-1">
                    <p className="font-semibold text-on-background opacity-55">{item.name}</p>
                  </div>
                </li>
              ))}
            </ul>
          </SurfaceCard>
        ) : null}

        <SurfaceCard className="space-y-6" padding="lg">
          <div>
            <h3 className="font-display text-lg leading-tight tracking-tight text-on-background">Participantes nesta sala</h3>
            <p className="mt-2 font-sans text-sm text-on-surface-variant">Convites locais ficam sempre por aqui, prontos para evoluir com o backend mais tarde.</p>
          </div>
          <div className="space-y-3">
            <form onSubmit={handleAddParticipant} className="flex flex-col gap-3 sm:flex-row">
              <input
                aria-label="Nome do participante"
                className="placeholder:text-on-surface-variant font-sans flex-1 rounded-lg border bg-surface-container-low px-5 py-2.5 outline-none focus:ring-2 focus:ring-primary/35"
                style={{ borderColor: 'var(--vc-card-border)' }}
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                placeholder="Nome do participante"
                required
              />
              <PrimaryButton type="submit" className="!normal-case sm:w-auto">
                Adicionar
              </PrimaryButton>
            </form>
            <ul className="space-y-3">
              {participants.map((p) => (
                <li key={p.id} className="flex flex-wrap gap-6 rounded-xl border px-6 py-3 font-sans" style={{ borderColor: 'var(--vc-card-border)' }}>
                  <span className="text-on-background">{p.name}</span>
                  <button type="button" className="ms-auto text-[11px] font-semibold uppercase text-error underline-offset-2 hover:underline" onClick={() => void handleRemoveParticipant(p.id)}>
                    Remover
                  </button>
                </li>
              ))}
              {!participants.length ? <li className="font-sans text-sm italic text-outline">Ainda não há convidados adicionados.</li> : null}
            </ul>
          </div>
        </SurfaceCard>
      </section>

      <div className="fixed inset-x-0 bottom-[5.85rem] z-30 px-[var(--spacing-margin-edge)]">
        <div className="mx-auto flex max-w-lg items-center gap-4 pb-10 md:max-w-xl">
          <PrimaryButton type="button" fullWidth className="!basis-[73%] !normal-case px-14 py-[1.125rem]" onClick={() => navigate(`/rooms/${slug}/shopping`)}>
            Estou indo comprar
          </PrimaryButton>
          <button
            type="button"
            aria-label="Adicionar item"
            onClick={() => navigate(`/rooms/${slug}/items/new`)}
            className="flex h-[4.625rem] w-[4.625rem] items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_22px_50px_-26px_rgb(243_209_134/.92)] transition hover:brightness-105"
          >
            <svg viewBox="0 0 24 24" className="h-9 w-9" stroke="currentColor" strokeWidth={2}>
              <path d="M12 5v13M5 12h13" />
            </svg>
          </button>
        </div>
      </div>

      {isDateSheetOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center px-[var(--spacing-margin-edge)] py-24">
          <button type="button" className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-label="Fechar" onClick={() => setIsDateSheetOpen(false)} />
          <SurfaceCard padding="lg" className="relative z-40 mb-44 w-full max-w-md">
            <div className="mb-8 flex items-start justify-between gap-8">
              <div>
                <p className="font-display text-2xl text-on-background">Próximo ciclo</p>
                <p className="mt-4 font-sans text-sm text-outline">Todos enxergarão esse marco assim que salvar aqui.</p>
              </div>
              <button type="button" className="text-3xl leading-none text-primary" aria-label="Fechar edição da data" onClick={() => setIsDateSheetOpen(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSavePlanned} className="space-y-14">
              <div>
                <label className="tracking-label block text-xs uppercase text-outline" htmlFor="planned-date-sheet">
                  Data planejada
                </label>
                <button
                  type="button"
                  className="mt-8 flex w-full items-center justify-between gap-6 rounded-2xl border px-10 py-[1rem] text-left"
                  style={{ borderColor: 'var(--vc-card-border)', background: '#16130f' }}
                  onClick={() => {
                    nativeDateModalRef.current?.showPicker?.()
                    nativeDateModalRef.current?.click?.()
                  }}
                >
                  <span className="font-display text-xl text-on-background">{displayPlannedFormatted || 'Selecione na agenda'}</span>
                  <span className="text-primary underline">Alterar</span>
                </button>
                <input
                  ref={nativeDateModalRef}
                  id="planned-date-sheet"
                  type="date"
                  className="sr-only"
                  value={plannedDraft}
                  onChange={(event) => setPlannedDraft(event.target.value)}
                />
              </div>
              <PrimaryButton type="submit" fullWidth className="py-6 !normal-case">
                Confirmar ciclo revisado
              </PrimaryButton>
            </form>
          </SurfaceCard>
        </div>
      ) : null}
    </main>
  )
}
