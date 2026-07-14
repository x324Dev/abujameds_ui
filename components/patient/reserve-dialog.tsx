'use client'

import { CheckCircle2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiMutate } from '@/lib/fetcher'
import { formatNaira } from '@/lib/format'

export function ReserveDialog({
  result,
  drugName,
  open,
  onOpenChange,
}: {
  result: any | null // Tied to the database snake_case payload structural format
  drugName: string
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const [quantity, setQuantity] = useState(1)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reference, setReference] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setQuantity(1)
    setName('')
    setPhone('')
    setReference(null)
    setError(null)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!result) return
    setSubmitting(true)
    setError(null)
    
    try {
      // Maps fields directly to backend parameters schema expecting snake_case keys
      const res = await apiMutate<{ reference?: string; order_id?: string; order_ref?: string }>(
        '/api/v1/orders/reserve', 
        'POST', 
        {
          pharmacy_id: result.pharmacy_id,
          drug_name: drugName,
          quantity: quantity,
          patient_name: name,
          patient_phone: phone,
        }
      )
      
      // Handle standard fallback properties for order reference string identification
      const refCode = res.reference || res.order_ref || res.order_id || 'SUCCESS'
      setReference(refCode)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reserve. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogContent className="sm:max-w-md border-border bg-card">
        {reference ? (
          <div className="flex flex-col items-center py-4 text-center">
            <CheckCircle2 className="size-12 text-emerald-500" aria-hidden="true" />
            <h2 className="mt-3 text-xl font-semibold text-foreground">Reserved!</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              Show this reference at <span className="font-medium text-foreground">{result?.pharmacy_name}</span>. Your medication is held for 24 hours.
            </p>
            <p className="mt-4 rounded-lg bg-muted px-4 py-2 font-mono text-lg font-bold text-primary tracking-wider">
              {reference}
            </p>
            <Button className="mt-6 w-full" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold tracking-tight">Reserve {drugName}</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                {result?.pharmacy_name} &middot; {result ? formatNaira(result.price) : ''} each
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="qty" className="text-sm font-medium">Quantity</Label>
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  max={result?.quantity ?? 10}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  required
                  className="bg-background border-border"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">Your name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                  className="bg-background border-border"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium">Phone number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234..."
                  required
                  className="bg-background border-border"
                />
              </div>
              
              {result && (
                <div className="flex items-center justify-between rounded-lg bg-muted/60 border border-border px-3 py-2 text-sm">
                  <span className="text-muted-foreground">Total Summary Amount</span>
                  <span className="font-bold text-foreground">
                    {formatNaira((result.price || 0) * quantity)}
                  </span>
                </div>
              )}
              
              {error && <p className="text-xs font-medium text-destructive text-left">{error}</p>}
            </div>
            
            <DialogFooter>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin mr-2" aria-hidden="true" />}
                Confirm reservation
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}