import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { OutlineGoldButton } from './OutlineGoldButton'
import { PrimaryButton } from './PrimaryButton'
import { SurfaceCard } from './SurfaceCard'

export type ConfirmDialogProps = {
  open: boolean
  title: string
  description?: ReactNode
  cancelLabel?: string
  confirmLabel?: string
  /** Confirmação destrutiva (ex.: excluir) — botão principal em tom de erro. */
  danger?: boolean
  busy?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  cancelLabel = 'Cancelar',
  confirmLabel = 'Confirmar',
  danger = false,
  busy = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, busy, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-[var(--spacing-margin-edge)] py-10">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 backdrop-blur-md"
        style={{ backgroundColor: 'var(--vc-overlay)' }}
        onClick={() => !busy && onCancel()}
      />

      <SurfaceCard padding="lg" className="relative z-10 mx-auto w-full max-w-md shadow-2xl">
        <h2 className="font-display text-xl leading-snug tracking-tight text-on-background">{title}</h2>
        {description ? (
          <div className="mt-4 font-sans text-sm leading-relaxed text-on-surface-variant">{description}</div>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <OutlineGoldButton type="button" className="!normal-case sm:min-w-[7.5rem]" disabled={busy} onClick={onCancel}>
            {cancelLabel}
          </OutlineGoldButton>
          {danger ? (
            <button
              type="button"
              disabled={busy}
              className="inline-flex cursor-pointer items-center justify-center rounded-lg px-5 py-3 font-display text-[0.9375rem] font-semibold transition hover:brightness-105 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-55 sm:min-w-[7.5rem]"
              style={{ backgroundColor: 'var(--color-error)', color: 'var(--color-on-error)' }}
              onClick={onConfirm}
            >
              {busy ? 'Aguarde…' : confirmLabel}
            </button>
          ) : (
            <PrimaryButton type="button" className="!normal-case sm:min-w-[7.5rem]" disabled={busy} onClick={onConfirm}>
              {busy ? 'Aguarde…' : confirmLabel}
            </PrimaryButton>
          )}
        </div>
      </SurfaceCard>
    </div>
  )
}
