// 'use client'

import { useSearchParams } from 'next/navigation'
import { Map as MapIcon, PackageX } from 'lucide-react'
import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { MapView, type MapMarker } from '@/components/map/map-view'
import { PharmacyResultCard } from '@/components/patient/pharmacy-result-card'
import { ReserveDialog } from '@/components/patient/reserve-dialog'
import { SearchBar } from '@/components/patient/search-bar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { fetcher } from '@/lib/fetcher'
import { cn } from '@/lib/utils'
import { useLocation } from '@/hooks/use-Location'

const RADII = [5, 10, 20]

export function SearchClient() {
  const params = useSearchParams()
  const query = params.get('q') ?? ''
  
  const [radius, setRadius] = useState(10)
  const [reserving, setReserving] = useState<any | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mobileMapOpen, setMobileMapOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Invoke location hook to get client coordinates for backend query matching
  const location = useLocation()
  const lat = location?.lat ?? 9.0578
  const lng = location?.lng ?? 7.4951

  // Build backend search URL explicitly passing geocoded params
  const searchParams = new URLSearchParams()
  searchParams.set('q', query.trim())
  searchParams.set('lat', String(lat))
  searchParams.set('lng', String(lng))
  searchParams.set('radius_km', String(radius))

  // Endpoint targeting derived from newAPI.md guidelines
  const shouldFetch = query.trim().length >= 2
  const fetchUrl = shouldFetch ? `/api/v1/search/drugs?${searchParams.toString()}` : null

  const { data, isLoading } = useSWR<any>(fetchUrl, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
  })

  // Safe normalization using exact backend snake_case response signatures
  const results = data?.results ?? []
  const drugName = data?.drug?.generic_name || data?.drug?.name || query

  const markers: MapMarker[] = useMemo(
    () =>
      results.map((r: any) => ({
        id: r.pharmacy_id,
        lat: r.latitude ?? r.lat,
        lng: r.longitude ?? r.lng,
        kind: 'pharmacy' as const,
        label: r.pharmacy_name,
        sublabel: `${(r.distance_km ?? 0).toFixed(1)}km · ₦${(r.price || 0).toLocaleString()}`,
      })),
    [results],
  )

  function openReserve(r: any) {
    setReserving(r)
    setDialogOpen(true)
  }

  const handleMarkerClick = (id: string) => {
    setActiveId(id)
    const cardElement = document.getElementById(`pharmacy-card-${id}`)
    if (cardElement) {
      cardElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      })
    }
  }

  const list = (
    <div className="flex flex-col gap-4">
      <SearchBar initialQuery={query} size="md" />
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? 'Searching…'
            : `${results.length} ${results.length === 1 ? 'pharmacy' : 'pharmacies'} with ${drugName}`}
        </p>
        <div className="flex items-center gap-1 rounded-full border border-border bg-card p-0.5">
          {RADII.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRadius(r)}
              className={cn(
                'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                radius === r
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {r}km
            </button>
          ))}
        </div>
      </div>

      {!shouldFetch ? (
        <div className="text-center py-8 text-sm text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
          Please type at least 2 characters to check live pharmacy availability.
        </div>
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-14 text-center">
          <PackageX className="size-10 text-muted-foreground" aria-hidden="true" />
          <div>
            <p className="font-semibold text-foreground">
              No pharmacies found with {drugName} nearby
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try widening your radius or checking an alternative area council constraint.
            </p>
          </div>
          <Button variant="outline" onClick={() => setRadius(20)}>
            Expand search to 20km
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {results.map((r: any) => (
            <div
              key={r.pharmacy_id}
              id={`pharmacy-card-${r.pharmacy_id}`}
              onMouseEnter={() => setActiveId(r.pharmacy_id)}
              onMouseLeave={() => setActiveId(null)}
              className={cn(
                'rounded-xl transition-all duration-200 border border-transparent',
                activeId === r.pharmacy_id
                  ? 'ring-2 ring-primary ring-offset-2 scale-[1.01] shadow-md'
                  : 'hover:shadow-sm'
              )}
            >
              <PharmacyResultCard
                result={r}
                drugName={drugName}
                onReserve={openReserve}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop Layout Framework */}
      <div className="mx-auto hidden max-w-6xl gap-6 px-4 py-6 lg:flex">
        <div className="w-2/5 min-w-0 overflow-y-auto pr-1 select-none">{list}</div>
        <div className="sticky top-20 h-[calc(100vh-6rem)] w-3/5 overflow-hidden rounded-2xl border border-border bg-card shadow-inner">
          <MapView 
            markers={markers} 
            activeId={activeId}
            onMarkerClick={handleMarkerClick}
            className="h-full w-full" 
          />
        </div>
      </div>

      {/* Mobile Presentation Mode */}
      <div className="mx-auto max-w-2xl px-4 py-6 lg:hidden">
        {list}
        
        <Button
          className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 gap-2 rounded-full shadow-lg"
          size="lg"
          onClick={() => setMobileMapOpen(true)}
        >
          <MapIcon className="size-4" aria-hidden="true" />
          <span>View Interactive Map</span>
        </Button>
        
        <Sheet open={mobileMapOpen} onOpenChange={setMobileMapOpen}>
          <SheetContent side="bottom" className="h-[80vh] p-0 rounded-t-2xl overflow-hidden">
            <MapView 
              markers={markers} 
              activeId={activeId}
              onMarkerClick={handleMarkerClick}
              className="h-full w-full" 
            />
          </SheetContent>
        </Sheet>
      </div>

      <ReserveDialog
        result={reserving}
        drugName={drugName}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}