import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as itemsApi from '../api/items'
import * as roomsApi from '../api/rooms'
import { Chip } from '../components/design/Chip'
import { PrimaryButton } from '../components/design/PrimaryButton'
import { SurfaceCard } from '../components/design/SurfaceCard'
import { LAST_ROOM_SLUG_KEY } from '../constants/storage'
import { CATEGORY_LABELS } from '../lib/categories'
import type { ItemCategory } from '../types/api'

const categories: ItemCategory[] = ['COMIDA', 'BEBIDAS', 'LIMPEZA', 'HIGIENE', 'DIA_A_DIA', 'OUTROS']

const units = ['kg', 'g', 'L', 'ml', 'un', 'pct', 'cx'] as const

export function AddItemPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()

  const [itemName, setItemName] = useState('')
  const [qty, setQty] = useState('')
  const [unit, setUnit] = useState<(typeof units)[number]>('kg')
  const [category, setCategory] = useState<ItemCategory>('COMIDA')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!slug) return
    localStorage.setItem(LAST_ROOM_SLUG_KEY, slug)
    void roomsApi.getRoom(slug).catch(() => null)
  }, [slug])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!slug) return
    const quantityCombined = `${qty.trim() || '1'} ${unit}`.trim()

    setLoading(true)
    try {
      await itemsApi.createItem(slug, {
        name: itemName.trim(),
        quantity: quantityCombined,
        category,
      })
      toast.success('Item salvo.')
      navigate(`/rooms/${slug}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao adicionar item.')
    } finally {
      setLoading(false)
    }
  }

  const qtyDisplay = qty.trim().length === 0 ? null : qty.trim()

  const pencilIcon = (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M13 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11.17" />
      <path d="M21.707 10.707 18.294 14.121l-9.06 9.06a3 3 0 0 1-1.065.682l-2.944.982.983-2.944a3 3 0 0 1 .682-1.064l9.716-9.716 2.83 2.828Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )

  const saveIconCircle = (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-on-primary bg-on-primary text-primary">
      <svg viewBox="0 0 24 24" className="h-5 w-5" stroke="currentColor" fill="none" strokeWidth={2}>
        <path d="M20 7 10 17l-5-5" />
      </svg>
    </span>
  )

  return (
    <main className="mx-auto w-full max-w-lg px-[var(--spacing-margin-edge)] pb-36 pt-6 md:max-w-xl">
      <header className="relative mb-10 flex flex-col items-center px-10 text-center">
        <Link to={slug ? `/rooms/${slug}` : '/'} className="absolute left-0 top-1 text-primary" aria-label="Voltar">
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current" strokeWidth="2">
            <path d="M14 18 8 12l6-6" />
          </svg>
        </Link>
        <h1 className="font-display text-[1.65rem] font-medium tracking-tight text-on-background">Adicionar item</h1>
        <p className="mt-3 max-w-sm font-sans text-sm leading-relaxed text-on-surface-variant">
          Inclua um produto na lista compartilhada
        </p>
      </header>

      <SurfaceCard className="mb-6 flex items-center gap-4" padding="lg">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border text-primary shadow-inner" style={{ borderColor: 'var(--vc-card-border)', background: 'rgba(16,14,9,0.75)' }}>
          <svg viewBox="0 0 24 24" className="h-8 w-8" stroke="currentColor" fill="none" strokeWidth={1.4}>
            <path d="M6 11h13l-.8 9H8.05L7 14H5m1-9h17l-.7 9H13" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="8" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-xl text-on-surface">{itemName || 'Novo produto'}</p>
          <p className="mt-2 font-sans text-sm leading-relaxed text-on-surface-variant">
            {!qtyDisplay ? <span className="text-outline">Informe quantidade • </span> : `${qtyDisplay} • `}
            <span className="text-primary">{CATEGORY_LABELS[category]}</span>
          </p>
        </div>
      </SurfaceCard>

      <SurfaceCard padding="lg">
        <form id="add-item-form" onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="tracking-label mb-2 block font-sans text-xs font-semibold uppercase text-primary">Nome</label>
            <div className="flex items-center gap-3 rounded-xl border px-4 py-2.5" style={{ borderColor: 'var(--vc-card-border)', backgroundColor: '#100e09' }}>
              <span className="text-primary">{pencilIcon}</span>
              <input
                className="placeholder:text-on-surface-variant flex-1 border-0 bg-transparent py-1 font-sans text-base text-on-surface outline-none"
                placeholder="Arroz"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-[38%] min-w-[7rem]">
              <label className="tracking-label mb-2 block font-sans text-xs font-semibold uppercase text-primary">Quantidade</label>
              <div className="flex items-center rounded-xl border pe-3" style={{ borderColor: 'var(--vc-card-border)', backgroundColor: '#100e09' }}>
                <span aria-hidden className="pl-3 font-sans font-semibold text-on-surface-variant">
                  #
                </span>
                <input
                  inputMode="decimal"
                  placeholder="5"
                  className="w-full border-0 bg-transparent py-2.5 ps-2 font-sans text-base text-on-surface outline-none"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <label className="tracking-label mb-2 block font-sans text-xs font-semibold uppercase text-primary">Unidade</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 inline-flex -translate-y-1/2 text-primary" aria-hidden>
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 21a9 9 0 1 0-9-9" />
                  </svg>
                </span>
                <select
                  className="font-sans w-full appearance-none rounded-xl border bg-[#100e09] px-11 py-2.5 pe-11 text-base text-on-surface outline-none"
                  style={{ borderColor: 'var(--vc-card-border)' }}
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as (typeof units)[number])}
                >
                  {units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden viewBox="0 0 24 24">
                  <path d="M8 11l4 4 4-4" />
                </svg>
              </div>
            </div>
          </div>

          <div>
            <p className="tracking-label mb-3 font-sans text-xs font-semibold uppercase text-primary">Categoria</p>
            <div className="flex gap-3 overflow-x-auto pb-3 [-webkit-overflow-scrolling:touch]" style={{ scrollbarWidth: 'none' }}>
              {categories.map((key) => (
                <Chip key={key} type="button" active={category === key} lowercase className="shrink-0 !px-6 !py-4 !text-sm" onClick={() => setCategory(key)}>
                  {CATEGORY_LABELS[key]}
                </Chip>
              ))}
            </div>
          </div>
        </form>
      </SurfaceCard>

      <div className="fixed inset-x-0 bottom-[5.75rem] z-30 px-[var(--spacing-margin-edge)] pb-2 pt-3">
        <PrimaryButton form="add-item-form" type="submit" disabled={loading} fullWidth className="!normal-case rounded-2xl py-5 text-xl font-semibold">
          <span className="flex items-center justify-center gap-5">
            {saveIconCircle}
            <span>{loading ? 'Salvando…' : 'Salvar item'}</span>
          </span>
        </PrimaryButton>
      </div>
    </main>
  )
}
