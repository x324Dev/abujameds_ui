'use client'

import useSWR from 'swr'
import { useState } from 'react'
import { fetcher, apiMutate } from '@/lib/fetcher'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatNaira } from '@/lib/format'
import { toast } from 'sonner'
import { 
  Loader2, 
  Check, 
  X, 
  Clock, 
  Phone, 
  User, 
  PackageCheck,
  AlertCircle
} from 'lucide-react'

interface OrderReservation {
  id: string
  order_ref: string
  drug_name: string
  quantity: number
  patient_name: string
  patient_phone: string
  total_price: number
  status: 'pending' | 'collected' | 'cancelled' | 'expired'
  created_at: string
}

export function PharmacyOrdersDashboard() {
  const { data: orders, error, isLoading, mutate } = useSWR<OrderReservation[]>(
    '/api/v1/orders', 
    fetcher,
    { refreshInterval: 30000 } // Auto-poll every 30 seconds for live orders
  )
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  async function transitionOrderStatus(orderId: string, nextStatus: 'collected' | 'cancelled') {
    setUpdatingId(orderId)
    try {
      // Direct PATCH mutation target adhering to backend routing contracts
      await apiMutate(`/api/v1/orders/${orderId}`, 'PATCH', {
        status: nextStatus
      })
      
      toast.success(`Order marked as ${nextStatus}`)
      // Optimistically trigger an SWR revalidation profile cache update
      mutate()
    } catch (err) {
      toast.error('Failed to change reservation state. Try again.')
    } finally {
      setUpdatingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary mb-2" />
        <p className="text-sm">Fetching active pharmacy reservation holds...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 border border-destructive/20 bg-destructive/10 text-destructive text-sm rounded-xl flex items-center gap-2">
        <AlertCircle className="size-4" />
        <span>Could not load order ledger. Check pharmacy administrative permissions.</span>
      </div>
    )
  }

  // Filter out to only show active working items at the top
  const activeOrders = orders?.filter(o => o.status === 'pending') || []
  const pastOrders = orders?.filter(o => o.status !== 'pending') || []

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto px-4 py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Reservation Manager</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Process matching patient identification holds and fulfill walk-in distribution.
        </p>
      </div>

      {/* Section: Actionable Pending Reservations */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Clock className="size-4 text-amber-500" />
          Active Holds ({activeOrders.length})
        </h2>
        
        {activeOrders.length === 0 ? (
          <Card className="p-8 border-dashed border-2 text-center text-muted-foreground bg-muted/20">
            <PackageCheck className="size-8 mx-auto text-muted-foreground/60 mb-2" />
            <p className="text-sm font-medium">No pending medication holds found at this time.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOrders.map((order) => (
              <Card key={order.id} className="p-5 border-border bg-card shadow-sm flex flex-col justify-between hover:border-primary/30 transition-all">
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-muted pb-3 mb-3">
                    <div>
                      <span className="font-mono text-xs font-bold uppercase bg-muted text-primary px-2 py-1 rounded">
                        REF: {order.order_ref}
                      </span>
                      <h3 className="text-base font-bold text-foreground mt-2">{order.drug_name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Quantity requested: <span className="font-semibold text-foreground">{order.quantity}</span></p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-foreground">{formatNaira(order.total_price)}</span>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Pay on Counter</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="size-3.5 shrink-0" />
                      <span className="truncate text-foreground font-medium">{order.patient_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="size-3.5 shrink-0" />
                      <a href={`tel:${order.patient_phone}`} className="hover:underline text-foreground">{order.patient_phone}</a>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-muted flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive border-border"
                    disabled={updatingId !== null}
                    onClick={() => transitionOrderStatus(order.id, 'cancelled')}
                  >
                    {updatingId === order.id ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3.5 mr-1.5" />}
                    Cancel Hold
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={updatingId !== null}
                    onClick={() => transitionOrderStatus(order.id, 'collected')}
                  >
                    {updatingId === order.id ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3.5 mr-1.5" />}
                    Mark Collected
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Section: Archived / Closed Reservations */}
      <section className="space-y-3 pt-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Historical Ledger Log</h2>
        <Card className="overflow-x-auto border-border bg-card">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="p-3">Reference</th>
                <th className="p-3">Medication</th>
                <th className="p-3">Patient</th>
                <th className="p-3">Amount</th>
                <th className="p-3 text-right">Settlement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted">
              {pastOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3 font-mono text-xs font-bold text-foreground">{order.order_ref}</td>
                  <td className="p-3">
                    <div className="font-medium text-foreground">{order.drug_name}</div>
                    <div className="text-[11px] text-muted-foreground">Qty: {order.quantity}</div>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">{order.patient_name}</td>
                  <td className="p-3 font-medium text-foreground">{formatNaira(order.total_price)}</td>
                  <td className="p-3 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold capitalize ${
                      order.status === 'collected' 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {pastOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-xs text-muted-foreground">No historical archive log data accessible.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  )
}