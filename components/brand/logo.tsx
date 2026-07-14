import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Logo({
  className,
  href = '/',
  showText = true,
}: {
  className?: string
  href?: string | null
  showText?: boolean
}) {
  const mark = (
    <span className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.5 20.5 20.5 10.5a5 5 0 0 0-7-7L3.5 13.5a5 5 0 0 0 7 7Z" />
          <path d="m8.5 8.5 7 7" />
        </svg>
      </span>
      {showText && (
        <span className="text-lg font-bold tracking-tight text-foreground">
          Abuja<span className="text-primary">Meds</span>
        </span>
      )}
    </span>
  )

  if (href) {
    return (
      <Link href={href} className={cn('inline-flex', className)} aria-label="AbujaMeds home">
        {mark}
      </Link>
    )
  }
  return <div className={cn('inline-flex', className)}>{mark}</div>
}
