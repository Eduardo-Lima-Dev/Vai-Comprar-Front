import clsx from 'clsx'

type BrandLogoProps = {
  className?: string
  alt?: string
  /** Barra superior e espaços apertados — altura ~40px. */
  compact?: boolean
  /** Hero login/cadastro — logo maior limitado pela viewport. */
  hero?: boolean
}

export function BrandLogo({ className, alt = 'Vai Comprar', compact, hero }: BrandLogoProps) {
  return (
    <img
      src="/logo.svg"
      alt={alt}
      width={1200}
      height={1200}
      decoding="async"
      loading="eager"
      className={clsx(
        'object-contain object-center select-none',
        hero && 'mx-auto max-h-[min(260px,38vh)] w-full max-w-[300px]',
        compact && 'max-h-14 w-auto max-w-[min(56vw,220px)] sm:max-h-16',
        !hero && !compact && 'mx-auto max-h-32 w-full max-w-[220px]',
        className,
      )}
    />
  )
}
