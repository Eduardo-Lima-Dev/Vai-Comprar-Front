import type { ReactNode, SelectHTMLAttributes } from 'react'
import clsx from 'clsx'

type IconSelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  icon: ReactNode
  label?: string
  containerClassName?: string
}

export function IconSelectField({ icon, label, containerClassName, className, id, children, ...props }: IconSelectFieldProps) {
  const selectId = id ?? props.name ?? 'icon-select-field'

  return (
    <div className={clsx('w-full', containerClassName)}>
      {label ? (
        <label htmlFor={selectId} className="sr-only">
          {label}
        </label>
      ) : null}
      <div
        className={clsx(
          'flex items-center gap-3 rounded-xl border bg-surface-container-lowest px-4 py-2.5 shadow-inner',
          'focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary/25',
        )}
        style={{ borderColor: 'var(--vc-card-border)' }}
      >
        <span className="flex shrink-0 text-primary">{icon}</span>
        <select
          id={selectId}
          className={clsx(
            'font-sans min-w-0 flex-1 cursor-pointer appearance-none bg-transparent py-1 text-base text-on-surface outline-none',
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <span className="pointer-events-none flex shrink-0 text-primary" aria-hidden>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 11l4 4 4-4" />
          </svg>
        </span>
      </div>
    </div>
  )
}
