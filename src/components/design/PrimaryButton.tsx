import type { ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean
}

export function PrimaryButton({ className, fullWidth, type = 'button', ...props }: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        'inline-flex cursor-pointer items-center justify-center rounded-lg bg-primary px-5 py-3',
        'font-display text-[0.9375rem] font-semibold text-on-primary',
        'shadow-[0_12px_32px_-12px_rgb(243_209_134/0.45)] transition hover:brightness-105 active:brightness-95',
        'disabled:cursor-not-allowed disabled:opacity-55',
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    />
  )
}
