import type { InputHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

type IconTextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  icon: ReactNode
  label?: string
  containerClassName?: string
  /** Conteúdo após o input (ex.: botão mostrar senha). */
  endAdornment?: ReactNode
}

export function IconTextField({ icon, label, containerClassName, className, id, endAdornment, ...props }: IconTextFieldProps) {
  const inputId = id ?? props.name ?? `field-${props.placeholder ?? ''}`

  return (
    <div className={clsx('w-full', containerClassName)}>
      {label ? (
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>
      ) : null}
      <div
        className={clsx(
          'flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2.5 shadow-inner',
          'focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary/25',
          className,
        )}
      >
        <span className="flex shrink-0 text-primary">{icon}</span>
        <input
          id={inputId}
          className={clsx(
            'font-sans placeholder:text-on-surface-variant',
            'min-w-0 flex-1 bg-transparent py-1 text-base text-on-surface outline-none',
          )}
          {...props}
        />
        {endAdornment ? <span className="flex shrink-0 items-center">{endAdornment}</span> : null}
      </div>
    </div>
  )
}
