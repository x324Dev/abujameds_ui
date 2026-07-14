import { CheckCircle2, CircleDashed, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StockStatus } from '@/lib/api/types'

const CONFIG: Record<
  StockStatus,
  { label: string; className: string; Icon: typeof CheckCircle2 }
> = {
  in_stock: {
    label: 'In Stock',
    className: 'bg-success-muted text-success-foreground',
    Icon: CheckCircle2,
  },
  low_stock: {
    label: 'Low Stock',
    className: 'bg-warning-muted text-warning-foreground',
    Icon: CircleDashed,
  },
  out_of_stock: {
    label: 'Out of Stock',
    className: 'bg-danger-muted text-danger-foreground',
    Icon: XCircle,
  },
}

export function StockBadge({
  status,
  className,
}: {
  status: StockStatus
  className?: string
}) {
  const { label, className: cls, Icon } = CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        cls,
        className,
      )}
    >
      <Icon className="size-3" aria-hidden="true" />
      {label}
    </span>
  )
}
