import type { PropsWithChildren } from 'react'
import clsx from 'clsx'

type SurfaceCardProps = PropsWithChildren<{
  className?: string
  as?: 'div' | 'article' | 'section'
  padding?: 'md' | 'lg'
}>

export function SurfaceCard({ children, className, as: Component = 'div', padding = 'md' }: SurfaceCardProps) {
  const pad = padding === 'lg' ? 'p-6' : 'p-5'
  return (
    <Component
      className={clsx(
        'rounded-xl border bg-surface-container text-on-surface shadow-[0_24px_60px_-24px_rgb(0_0_0/0.55)]',
        pad,
        className,
      )}
      style={{ borderColor: 'var(--vc-card-border)' }}
    >
      {children}
    </Component>
  )
}
