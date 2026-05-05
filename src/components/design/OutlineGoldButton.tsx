import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type OutlineGoldButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean
}

export function OutlineGoldButton({ className, fullWidth, type = 'button', ...props }: OutlineGoldButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex cursor-pointer items-center justify-center rounded-lg border border-primary-container px-4 py-2.5 text-sm font-semibold uppercase tracking-label text-primary transition hover:bg-primary/10 disabled:opacity-55',
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    />
  )
}
