import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as itemsApi from '../api/items'
import * as participantsApi from '../api/participants'
import * as roomsApi from '../api/rooms'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { HamburgerMenu } from '../components/HamburgerMenu'
import { Chip } from '../components/design/Chip'
import { ConfirmDialog } from '../components/design/ConfirmDialog'
import { OutlineGoldButton } from '../components/design/OutlineGoldButton'
import { PrimaryButton } from '../components/design/PrimaryButton'
import { SurfaceCard } from '../components/design/SurfaceCard'
import { roomsCacheKey } from '../constants/storage'
import { CATEGORY_LABELS, ROOM_FILTER_CATEGORIES } from '../lib/categories'
import { formatPlannedDateRaw, parseDateInputToIso, toDateInputValue } from '../lib/format'
import type { Item, ItemCategory, ItemStatus, Participant, Room } from '../types/api'

type RoomState = {
  room: Room | null
  items: Item[]
}

/** Quantidade de pendentes exibidos antes de pedir “Mostrar mais”. */
const PENDING_PAGE_SIZE = 10

function initialsFromName(name: string, maxLetters = 2) {
  return name
    .split(/\s+/)
    .slice(0, maxLetters)
    .map((p) => p.charAt(0).toUpperCase())
    .join('')
}

function categoryGlyph(category: ItemCategory) {
  const cls = 'h-7 w-7 shrink-0 stroke-current'
  const sw = 1.45
  switch (category) {
    case 'COMIDA':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" strokeWidth={sw}>
          <path d="M5 21h13M7 21V13h6v8m-9 8V17h13v4m-13-11V7h13v10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'BEBIDAS':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" strokeWidth={sw}>
          <path d="M11 21V14M9 21h6m-10-14h14l-.7 14H12.7z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'LIMPEZA':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" strokeWidth={sw}>
          <path d="M17 21H7v-9l10-11v15Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'HIGIENE':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" strokeWidth={sw}>
          <path d="M12 3v4M9 7h6l-1 14H10L9 7z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 11h8M8 15h8" strokeLinecap="round" />
        </svg>
      )
    case 'DIA_A_DIA':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" strokeWidth={sw}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'OUTROS':
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" strokeWidth={sw}>
          <path d="M8 8h12v12H8z" strokeLinejoin="round" />
          <path d="M4 16V4h12" strokeLinecap="round" strokeLinejoin="round" />
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
  const [filterCategory, setFilterCategory] = useState<ItemCategory | null>(null)
  const [isDateSheetOpen, setIsDateSheetOpen] = useState(false)
  const [plannedDraft, setPlannedDraft] = useState('')
  const nativeDateModalRef = useRef<HTMLInputElement>(null)
  const [pendingVisibleCount, setPendingVisibleCount] = useState(PENDING_PAGE_SIZE)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [roomActionPending, setRoomActionPending] = useState<'leave' | 'delete' | null>(null)
  const [roomActionBusy, setRoomActionBusy] = useState(false)

  const isCreator = Boolean(state.room && user?.id === state.room.createdById)

  const pendingItems = useMemo(() => state.items.filter((item) => item.status !== 'PURCHASED'), [state.items])
  const purchasedItems = useMemo(() => state.items.filter((item) => item.status === 'PURCHASED'), [state.items])
  const participants: Participant[] = state.room?.participants ?? []

  function getErrorMessage(err: unknown, fallback: string) {
    return err instanceof Error ? err.message : fallback
  }

  async function loadRoomData() {
    if (!slug) return
    try {
      const [room, items] = await Promise.all([roomsApi.getRoom(slug), itemsApi.listItems(slug)])
      setState({
        room: { ...room, participants: Array.isArray(room.participants) ? room.participants : [] },
        items: Array.isArray(items) ? items : [],
      })
    } catch (err) {
      if (err instanceof ApiError && (err.status === 403 || err.status === 404)) {
        toast.warning('Você não tem acesso a esta sala nesta conta. Entre por um slug válido.')
        navigate('/rooms/access', { replace: true })
        return
      }
      toast.error(getErrorMessage(err, 'Erro ao carregar sala.'))
    }
  }

  useEffect(() => {
    void loadRoomData()
    const interval = setInterval(() => void loadRoomData(), 10000)
    return () => clearInterval(interval)
  }, [slug])

  useEffect(() => {
    if (slug) void roomsApi.touchRoom(slug).catch(() => null)
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

  function invalidateRoomCache() {
    if (!user) return
    try {
      const key = roomsCacheKey(user.id)
      const cached = localStorage.getItem(key)
      if (cached) {
        const rooms = JSON.parse(cached) as Room[]
        localStorage.setItem(key, JSON.stringify(rooms.filter((r) => r.slug !== slug)))
      }
    } catch { /* ignore */ }
  }

  async function confirmLeaveRoom() {
    if (!slug) return
    setRoomActionBusy(true)
    try {
      await roomsApi.leaveRoom(slug)
      invalidateRoomCache()
      toast.success('Você saiu da sala.')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao sair da sala.'))
      setRoomActionBusy(false)
      setRoomActionPending(null)
    }
  }

  async function confirmDeleteRoom() {
    if (!slug) return
    setRoomActionBusy(true)
    try {
      await roomsApi.deleteRoom(slug)
      invalidateRoomCache()
      toast.success('Sala apagada com sucesso.')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao apagar sala.'))
      setRoomActionBusy(false)
      setRoomActionPending(null)
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

  async function confirmDeleteItem() {
    if (!slug || !deleteTarget) return
    setDeleteBusy(true)
    try {
      await itemsApi.deleteItem(slug, deleteTarget.id)
      toast.success('Item removido com sucesso.')
      setDeleteTarget(null)
      await loadRoomData()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao remover item.'))
    } finally {
      setDeleteBusy(false)
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

  async function handleCopyRoomLink() {
    if (!slug) return
    const link = `${window.location.origin}/rooms/${slug}`
    try {
      await navigator.clipboard?.writeText(link)
      toast.success('Link da sala copiado.')
    } catch {
      toast.error('Não foi possível copiar o link.')
    }
  }

  const filteredPending = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return pendingItems.filter((item) => {
      const catOk = !filterCategory || item.category === filterCategory
      if (!needle) return catOk
      const hay = `${item.name} ${item.quantity}`.toLowerCase()
      return catOk && hay.includes(needle)
    })
  }, [pendingItems, filterCategory, search])

  useEffect(() => {
    setPendingVisibleCount(PENDING_PAGE_SIZE)
  }, [filterCategory, search, slug])

  const visiblePendingPage = useMemo(
    () => filteredPending.slice(0, pendingVisibleCount),
    [filteredPending, pendingVisibleCount],
  )
  const pendingTotal = filteredPending.length
  const hasMorePending = pendingTotal > pendingVisibleCount
  const nextChunk = Math.min(PENDING_PAGE_SIZE, pendingTotal - pendingVisibleCount)

  const participantRing = participants.slice(0, 6)

  const displayPlannedFormatted = plannedDraft ? formatPlannedDateRaw(parseDateInputToIso(plannedDraft)) : ''

  return (
    <main className="mx-auto w-full max-w-lg px-[var(--spacing-margin-edge)] pb-[13rem] pt-6 md:max-w-xl">
      {/* Top chrome */}
      <header className="mb-10 flex flex-col gap-10">
        <div className="flex items-start justify-end">
          <HamburgerMenu
            roomSlug={slug}
            onArchiveRoom={isCreator ? handleArchiveRoom : undefined}
            onDeleteRoom={isCreator ? () => setRoomActionPending('delete') : undefined}
            onLeaveRoom={!isCreator && state.room ? () => setRoomActionPending('leave') : undefined}
          />
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 border-b pb-10" style={{ borderColor: 'var(--vc-card-border)' }}>
          <div>
            <h1 className="font-display text-[2rem] tracking-tight text-on-background">{state.room?.name ? state.room.name : `Sala ${slug}`}</h1>
            <p className="mt-2 font-sans text-sm text-on-surface-variant">Lista compartilhada</p>
          </div>
          <OutlineGoldButton type="button" className="!normal-case px-4 py-2 text-xs" onClick={() => void handleCopyRoomLink()}>
            Copiar link
          </OutlineGoldButton>
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
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="font-display text-lg text-on-background">Pendentes</h2>
            {pendingTotal > 0 ? (
              <p className="font-sans text-xs text-on-surface-variant">
                Mostrando {visiblePendingPage.length} de {pendingTotal}
              </p>
            ) : null}
          </div>

          {!filteredPending.length ? (
            <SurfaceCard padding="lg" className="text-center font-sans text-sm text-on-surface-variant">
              Nenhum item corresponde a este filtro ainda.
            </SurfaceCard>
          ) : null}

          {visiblePendingPage.map((item) => (
            <article
              key={item.id}
              className="flex items-center gap-3 rounded-xl border px-4 py-4 sm:gap-4 sm:px-5"
              style={{ borderColor: 'var(--vc-card-border)', background: 'rgba(39,37,34,0.78)' }}
            >
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border bg-surface-container-lowest text-primary"
                style={{ borderColor: 'var(--vc-card-border)' }}
                aria-hidden
              >
                {categoryGlyph(item.category)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-display text-xl leading-snug tracking-tight text-on-background">{item.name}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-sans text-sm text-on-surface-variant">{item.quantity}</span>
                  <span
                    className="rounded-md border px-2.5 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-primary"
                    style={{ borderColor: 'var(--vc-card-border)' }}
                  >
                    {CATEGORY_LABELS[item.category]}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  aria-pressed={item.status === 'PURCHASED'}
                  aria-label={item.status === 'PURCHASED' ? 'Marcar como pendente' : 'Marcar como comprado'}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition sm:h-11 sm:w-11 ${
                    item.status === 'PURCHASED'
                      ? 'border-primary-container bg-primary text-on-primary shadow-[0_0_28px_-8px_rgb(243_209_134/.5)]'
                      : 'border-primary-container bg-transparent text-primary hover:bg-primary/10'
                  }`}
                  onClick={() => handleUpdateItemStatus(item.id, item.status === 'PURCHASED' ? 'PENDING' : 'PURCHASED')}
                >
                  {item.status === 'PURCHASED' ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" stroke="currentColor" fill="none" strokeWidth={2.4}>
                      <path d="M20 7 10 17l-5-5" />
                    </svg>
                  ) : null}
                </button>
                <button
                  type="button"
                  aria-label={`Remover ${item.name}`}
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition hover:bg-error/10 hover:text-error"
                  onClick={() => setDeleteTarget({ id: item.id, name: item.name })}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 7h16M10 11v6M14 11v6M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" />
                  </svg>
                </button>
              </div>
            </article>
          ))}

          {hasMorePending ? (
            <div className="flex justify-center pt-2">
              <OutlineGoldButton
                type="button"
                className="!normal-case px-8 py-3 text-sm"
                onClick={() => setPendingVisibleCount((n) => n + PENDING_PAGE_SIZE)}
              >
                Mostrar mais {nextChunk > 0 ? `(${nextChunk})` : ''}
              </OutlineGoldButton>
            </div>
          ) : null}
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

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remover item?"
        description={
          deleteTarget ? (
            <>
              Tem certeza que deseja excluir{' '}
              <span className="font-semibold text-on-surface">{deleteTarget.name}</span> da lista desta sala? Esta ação não pode ser desfeita.
            </>
          ) : undefined
        }
        cancelLabel="Cancelar"
        confirmLabel="Excluir"
        danger
        busy={deleteBusy}
        onCancel={() => { if (!deleteBusy) setDeleteTarget(null) }}
        onConfirm={() => void confirmDeleteItem()}
      />

      <ConfirmDialog
        open={roomActionPending === 'leave'}
        title="Sair da sala?"
        description="Você perderá acesso a esta sala. Para voltar, precisará do slug ou link novamente."
        cancelLabel="Cancelar"
        confirmLabel="Sair"
        danger
        busy={roomActionBusy}
        onCancel={() => { if (!roomActionBusy) setRoomActionPending(null) }}
        onConfirm={() => void confirmLeaveRoom()}
      />

      <ConfirmDialog
        open={roomActionPending === 'delete'}
        title="Apagar sala?"
        description="Esta ação é permanente e remove todos os itens, compras e histórico da sala. Não pode ser desfeita."
        cancelLabel="Cancelar"
        confirmLabel="Apagar"
        danger
        busy={roomActionBusy}
        onCancel={() => { if (!roomActionBusy) setRoomActionPending(null) }}
        onConfirm={() => void confirmDeleteRoom()}
      />
    </main>
  )
}
