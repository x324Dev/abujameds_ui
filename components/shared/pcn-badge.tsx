import { BadgeCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PcnBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium text-secondary',
        className,
      )}
      title="Pharmacists Council of Nigeria verified"
    >
      <BadgeCheck className="size-3.5" aria-hidden="true" />
      PCN Verified
    </span>
  )
}
