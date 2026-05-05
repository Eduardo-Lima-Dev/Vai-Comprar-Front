import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
  lowercase?: boolean
}

export function Chip({ active, lowercase, className, type = 'button', children, ...props }: ChipProps) {
  return (
    <button
      type={type}
      className={clsx(
        'rounded-full border px-3 py-2 font-sans text-xs font-semibold tracking-wide transition',
        lowercase ? '!normal-case' : 'uppercase',
        active
          ? 'border-primary-container bg-primary text-on-primary shadow-[0_0_24px_-4px_rgb(243_209_134/0.35)]'
          : 'border-primary-container bg-surface-container text-primary hover:bg-surface-container-high',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
