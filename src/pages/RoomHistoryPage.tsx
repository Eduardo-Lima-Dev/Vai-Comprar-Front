import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as purchasesApi from '../api/purchases'
import * as roomsApi from '../api/rooms'
import { HamburgerMenu } from '../components/HamburgerMenu'
import { OutlineGoldButton } from '../components/design/OutlineGoldButton'
import { SurfaceCard } from '../components/design/SurfaceCard'
import { LAST_ROOM_SLUG_KEY } from '../constants/storage'
import type { Purchase, PurchaseDetail, Room } from '../types/api'

export function RoomHistoryPage() {
  const { slug = '' } = useParams()
  const [room, setRoom] = useState<Room | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseDetail | null>(null)

  function getErrorMessage(err: unknown, fallback: string) {
    return err instanceof Error ? err.message : fallback
  }

  async function loadHistory() {
    if (!slug) return
    try {
      const [roomData, purchasesData] = await Promise.all([roomsApi.getRoom(slug), purchasesApi.listPurchases(slug)])
      localStorage.setItem(LAST_ROOM_SLUG_KEY, slug)
      setRoom(roomData)
      setPurchases(Array.isArray(purchasesData) ? purchasesData : [])
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar historico.'))
    }
  }

  async function handleOpenPurchaseDetail(purchaseId: string) {
    if (!slug) return
    try {
      const detail = await purchasesApi.getPurchaseDetail(slug, purchaseId)
      setSelectedPurchase(detail)
      toast.success('Detalhe da compra carregado.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'Erro ao carregar detalhe da compra.'))
    }
  }

  useEffect(() => {
    void loadHistory()
  }, [slug])

  return (
    <main className="mx-auto w-full max-w-lg px-[var(--spacing-margin-edge)] pb-48 pt-6 md:max-w-xl">
      <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-[1.75rem] tracking-tight text-on-background">Histórico</h1>
          <p className="mt-3 font-display text-xl text-primary">{room?.name ?? `Sala ${slug}`}</p>
          <p className="mt-3 font-sans text-sm text-on-surface-variant">Compras finalizadas e registradas pela equipe da casa.</p>
        </div>
        <HamburgerMenu roomSlug={slug} />
      </header>

      <SurfaceCard padding="lg" className="space-y-8">
        <h2 className="font-display text-lg text-on-surface">Compras registradas</h2>

        {!purchases.length ? (
          <p className="font-sans text-sm text-on-surface-variant">Nenhuma compra arquivada ainda nesta sala.</p>
        ) : (
          <ul className="space-y-4">
            {purchases.map((purchase) => (
              <li
                key={purchase.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border px-4 py-4"
                style={{ borderColor: 'var(--vc-card-border)', background: 'rgba(21,17,13,0.55)' }}
              >
                <div className="font-sans text-sm text-on-surface">
                  <p className="font-medium text-on-background">{new Date(purchase.createdAt).toLocaleString('pt-BR')}</p>
                  <p className="mt-1 tracking-wide text-primary">R$ {Number(purchase.totalAmount ?? 0).toFixed(2)}</p>
                </div>
                <OutlineGoldButton type="button" className="text-xs tracking-[0.12em]" onClick={() => void handleOpenPurchaseDetail(purchase.id)}>
                  Detalhar
                </OutlineGoldButton>
              </li>
            ))}
          </ul>
        )}

        {selectedPurchase ? (
          <SurfaceCard padding="md" className="bg-surface-container-lowest/95 !shadow-none">
            <h3 className="font-display text-base text-on-surface">Compra selecionada</h3>
            <p className="mt-3 font-sans text-xs text-on-surface-variant">ID: {selectedPurchase.id}</p>
            <p className="mt-2 font-sans text-lg text-primary">
              Total: R$ {Number(selectedPurchase.totalAmount ?? 0).toFixed(2)}
            </p>
          </SurfaceCard>
        ) : null}
      </SurfaceCard>
    </main>
  )
}
