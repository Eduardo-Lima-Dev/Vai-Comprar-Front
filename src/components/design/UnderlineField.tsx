import type { InputHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'

type UnderlineFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  endAdornment?: ReactNode
}

export function UnderlineField({ label, id, endAdornment, className, ...props }: UnderlineFieldProps) {
  const inputId = id ?? props.name ?? `uf-${label}`

  return (
    <div className={clsx('w-full', className)}>
      <label htmlFor={inputId} className="tracking-label mb-2 block font-sans text-xs font-semibold uppercase text-on-surface-variant">
        {label}
      </label>
      <div className="flex items-center gap-2 border-b border-outline-variant pb-2">
        <input
          id={inputId}
          className="font-display min-h-[1.5rem] w-full flex-1 border-0 bg-transparent text-lg font-medium tracking-tight text-on-surface outline-none placeholder:text-on-surface-variant disabled:opacity-65"
          {...props}
        />
        {endAdornment}
      </div>
    </div>
  )
}
