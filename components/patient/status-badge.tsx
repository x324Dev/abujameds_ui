// components/orders/status-badge.tsx
import { Badge } from '@/components/ui/badge'
import { OrderStatus } from '@/lib/api/types'

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const variants: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
    pending: "secondary",
    confirmed: "default",
    ready: "default",
    dispatched: "default",
    completed: "default",
    cancelled: "destructive",
    expired: "outline",
  }

  return <Badge variant={variants[status]}>{status}</Badge>
}