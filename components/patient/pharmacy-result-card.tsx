"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCreateOrder } from '@/hooks/api' // Matches your hooks folder path
import { MapPin, Navigation, ShoppingBag, CheckCircle, Loader2, ShieldCheck, ExternalLink } from 'lucide-react'
// Import the unified, strict backend types directly
import { PharmacySearchResult } from '@/lib/api/types'

interface PharmacyCardProps {
  result: PharmacySearchResult
  drugName: string
  onReserve?: (result: PharmacySearchResult) => void
}

export function PharmacyResultCard({ result, drugName, onReserve }: PharmacyCardProps) {
  const { trigger: createOrder, isMutating } = useCreateOrder()
  const [orderPlaced, setOrderPlaced] = useState(false)

  // Correct, reliable Google Maps lookup utilizing plain text name & address
  const mapsSearchQuery = `${result.pharmacy_name} ${result.address || ''}`
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsSearchQuery)}`

  // Format Naira currency values safely without breaking on null values
  const formattedPrice = result.price_naira != null 
    ? `₦${result.price_naira.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : 'Price Unavailable'

  const handleReservation = async () => {
    // If the item is on an external partner platform with an explicit deep link, follow their workflow
    if (result.is_partner && result.partner_url) {
      window.open(result.partner_url, '_blank', 'noopener,noreferrer')
      return
    }

    if (!result.pharmacy_id) {
      console.error("Cannot process internal reservation: Missing pharmacy database key allocation.")
      return
    }

    try {
      await createOrder({
        drug_id: '', // Handled seamlessly via backend pipeline lookups or parent frame contexts
        facility_id: result.pharmacy_id,
        quantity: 1,
      })
      
      setOrderPlaced(true)
      if (onReserve) onReserve(result)
    } catch (err) {
      console.error("Procurement network reservation exception:", err)
    }
  }

  // Determine stock availability badge styling safely from the exact backend structure
  const isOutOfStock = result.stock_status === 'out_of_stock' || (result.quantity_in_stock !== null && result.quantity_in_stock <= 0)

  return (
    <Card className="border-border bg-card text-left overflow-hidden transition-all duration-200">
      <CardContent className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        
        {/* Core Metadata Display Area */}
        <div className="space-y-2 max-w-xl flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-extrabold text-foreground tracking-tight">
              {result.pharmacy_name}
            </h4>

            {/* PCN Regulatory Verification Badge */}
            {result.is_pcn_verified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10">
                <ShieldCheck className="size-3" /> PCN Verified
              </span>
            )}

            {/* Ecosystem Network Status Badge */}
            {result.is_partner && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10">
                Network Partner
              </span>
            )}
          </div>
          
          {/* Location details */}
          <div className="flex items-start gap-1 text-sm text-muted-foreground">
            <MapPin className="size-4 shrink-0 mt-0.5 text-muted-foreground/60" />
            <span className="line-clamp-2">{result.address || 'Physical address pending verification'}</span>
          </div>

          {/* Real-time Logistics Diagnostics metadata */}
          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground pt-0.5">
            <span className="text-primary font-bold">📍 {result.distance_km.toFixed(1)} km away</span>
            
            {result.quantity_in_stock !== null && (
              <span className={isOutOfStock ? 'text-destructive' : 'text-foreground/80'}>
                📦 Stock: {result.quantity_in_stock} units left
              </span>
            )}

            {result.last_updated_at && (
              <span className="text-[11px] font-normal text-muted-foreground/70">
                Updated {new Date(result.last_updated_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Operations Action Deck */}
        <div className="flex md:flex-col items-end justify-between md:justify-center gap-4 border-t md:border-t-0 border-border pt-4 md:pt-0 shrink-0 min-w-[140px]">
          
          {/* Naira Financial Panel */}
          <div className="text-left md:text-right space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price Estimate</p>
            <p className="text-xl font-black text-foreground tracking-tight">{formattedPrice}</p>
          </div>

          {/* Action Trigger Elements */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="border-border h-9 text-xs font-semibold shadow-sm flex-1 md:flex-initial"
            >
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="size-3.5 mr-1 text-muted-foreground" /> Map
              </a>
            </Button>

            {orderPlaced ? (
              <Button
                disabled
                size="sm"
                className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 h-9 text-xs font-bold flex-1 md:flex-initial"
              >
                <CheckCircle className="size-3.5 mr-1" /> Reserved
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleReservation}
                disabled={isMutating || isOutOfStock}
                variant={isOutOfStock ? 'secondary' : 'default'}
                className="h-9 text-xs font-bold shadow-sm flex-1 md:flex-initial"
              >
                {isMutating ? (
                  <>
                    <Loader2 className="size-3.5 mr-1 animate-spin" /> ...
                  </>
                ) : isOutOfStock ? (
                  'Out of Stock'
                ) : result.is_partner ? (
                  <>
                    Buy External <ExternalLink className="size-3 ml-1" />
                  </>
                ) : (
                  <>
                    <ShoppingBag className="size-3.5 mr-1" /> Reserve
                  </>
                )}
              </Button>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  )
}

export type { PharmacySearchResult }
