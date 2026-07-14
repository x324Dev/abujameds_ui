'use client'

import useSWR, { useSWRConfig } from 'swr'
import { fetcher } from '@/lib/fetcher'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, Package, XCircle } from 'lucide-react'
import { useState } from 'react'

// Sub-component to resolve drug details safely via client-side join
function OrderCard({ order, onCancel }: { order: any; onCancel: (id: string) => Promise<void> }) {
  const [isCancelling, setIsCancelling] = useState(false)
  
  // Fetches drug registry metadata using the native drug_id relational key
  const { data: drug, isLoading: drugLoading } = useSWR(
    order.drug_id ? `/api/v1/drugs/${order.drug_id}` : null,
    fetcher
  )

  const handleCancelClick = async () => {
    setIsCancelling(true)
    await onCancel(order.id)
    setIsCancelling(false)
  }

  return (
    <Card className="p-4 flex items-center justify-between border-border bg-card">
      <div>
        <h3 className="font-semibold text-foreground">
          {drugLoading ? (
            <span className="text-muted-foreground animate-pulse text-sm">Resolving formulation...</span>
          ) : (
            drug?.generic_name || 'Unknown Medication'
          )}
        </h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Quantity: {order.quantity} • <span className="capitalize">{order.order_type?.replace('_', ' ') || 'Reservation'}</span>
        </p>
        <Badge variant="outline" className="mt-2 capitalize font-semibold">
          {order.status}
        </Badge>
      </div>

      {order.status === 'pending' && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-destructive hover:text-destructive/90 hover:bg-destructive/5"
          onClick={handleCancelClick}
          disabled={isCancelling}
        >
          {isCancelling ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="mr-2 h-4 w-4" />
          )}
          Cancel
        </Button>
      )}
    </Card>
  )
}

export default function MyOrdersPage() {
  const { mutate } = useSWRConfig()
  
  // Fetch patient orders targeting the explicit trailing-slash endpoint
  const { data: orders, isLoading, error } = useSWR<any[]>(
    '/api/v1/orders/', 
    fetcher,
    { revalidateOnFocus: true }
  )

  const handleCancel = async (orderId: string) => {
    try {
      // Must utilize PUT method to match the backend contract
      const res = await fetch(`/api/v1/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || 'Cancellation rejected by server.')
      }

      toast.success('Order cancelled successfully')
      
      // Refresh the explicit trailing-slash endpoint cache bucket 
      mutate('/api/v1/orders/')
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel order')
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="grid gap-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl p-6 text-center text-sm text-destructive">
        Failed to load orders. Please re-authenticate and verify your network token.
      </div>
    )
  }

  const orderList = Array.isArray(orders) ? orders : []

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold mb-6 tracking-tight">My Orders</h1>
      
      {orderList.length === 0 ? (
        <Card className="p-12 text-center flex flex-col items-center gap-3 border-dashed bg-muted/10">
          <Package className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">You haven't placed any medical orders yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orderList.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onCancel={handleCancel} 
            />
          ))}
        </div>
      )}
    </div>
  )
}