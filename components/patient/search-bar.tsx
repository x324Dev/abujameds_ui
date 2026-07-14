'use client'

import { useRouter } from 'next/navigation'
import { Pill, Search, Loader2, MapPin } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { fetcher } from '@/lib/fetcher'
import { useLocation } from '@/hooks/use-Location'

export function SearchBar({
  initialQuery = '',
  size = 'lg',
  autoFocus = false,
  className,
}: {
  initialQuery?: string
  size?: 'lg' | 'md'
  autoFocus?: boolean
  className?: string
}) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Track patient coordinate space
  const location = useLocation()
  const lat = location?.lat ?? 9.0578
  const lng = location?.lng ?? 7.4951

  // Debounce hook to manage autocomplete call frequencies
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim())
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  // Build safe URL search parameters mapping directly to backend contracts
  const searchParams = new URLSearchParams()
  if (debouncedQuery) {
    searchParams.set('q', debouncedQuery)
    searchParams.set('lat', String(lat))
    searchParams.set('lng', String(lng))
    searchParams.set('radius_km', '15')
  }

  const searchUrl = debouncedQuery 
    ? `/api/v1/search/drugs?${searchParams.toString()}` 
    : null

  const { data, error, isLoading } = useSWR<any>(searchUrl, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  // Close type-ahead suggestions on outside click boundary cross
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setIsOpen(false)
    
    const targetParams = new URLSearchParams()
    targetParams.set('q', q)
    router.push(`/search?${targetParams.toString()}`)
  }

  function handleSelectSuggestion(selectedName: string) {
    setQuery(selectedName)
    setIsOpen(false)
    
    const targetParams = new URLSearchParams()
    targetParams.set('q', selectedName)
    router.push(`/search?${targetParams.toString()}`)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={submit}
        className={cn(
          'flex w-full items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm transition-all focus-within:border-primary focus-within:shadow-md',
          size === 'md' && 'rounded-xl p-1.5',
          className,
        )}
        role="search"
      >
        <Pill
          className={cn('ml-2 shrink-0 text-primary', size === 'lg' ? 'size-5' : 'size-4')}
          aria-hidden="true"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          autoFocus={autoFocus}
          placeholder="Drug name or NAFDAC number"
          aria-label="Search for a drug by name or NAFDAC number"
          className={cn(
            'min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground',
            size === 'lg' ? 'text-base' : 'text-sm',
          )}
        />
        
        {isLoading && (
          <Loader2 className="size-4 animate-spin text-muted-foreground shrink-0 mr-1" />
        )}

        <Button
          type="submit"
          size={size === 'lg' ? 'lg' : 'default'}
          className="shrink-0 gap-1.5"
        >
          <Search className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Search</span>
        </Button>
      </form>

      {/* Dropdown Suggestions */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-card border border-border rounded-xl shadow-lg max-h-80 overflow-y-auto divide-y divide-border">
          {error && (
            <div className="p-4 text-sm text-destructive text-left">
              Failed to query medications. Please check network token.
            </div>
          )}

          {!isLoading && !data?.drug && (!data?.results || data.results.length === 0) && (
            <div className="p-4 text-sm text-muted-foreground text-left">
              No matching medications found in Abuja pharmacies.
            </div>
          )}

          {/* Target Drug Registry Record */}
          {data?.drug && (
            <div
              onClick={() => handleSelectSuggestion(data.drug?.generic_name || data.drug?.name || '')}
              className="p-4 hover:bg-muted/50 cursor-pointer text-left transition-colors group"
            >
              <div className="flex justify-between items-start">
                <div className="min-w-0 pr-2">
                  <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {data.drug.generic_name || data.drug.name}
                  </h4>
                  {(data.drug.brand_name || data.drug.form) && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {data.drug.brand_name} {data.drug.strength && `• ${data.drug.strength}`} ({data.drug.form || 'Tablet'})
                    </p>
                  )}
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary uppercase tracking-wide shrink-0">
                  Medication
                </span>
              </div>
            </div>
          )}

          {/* Live Inventory Records Match */}
          {data?.results && data.results.length > 0 && (
            <div className="p-1.5">
              <p className="px-2.5 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-left">
                Available In Pharmacy Inventories ({data.total || data.results.length})
              </p>
              {data.results.slice(0, 4).map((pharmacy: any) => (
                <div
                  key={pharmacy.pharmacy_id}
                  onClick={() => handleSelectSuggestion(data.drug?.generic_name || data.drug?.name || query)}
                  className="w-full flex items-center justify-between p-2.5 hover:bg-muted/50 rounded-lg cursor-pointer text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className="size-4 text-secondary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {pharmacy.pharmacy_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {pharmacy.area_council || pharmacy.area || 'FCT'} • {(pharmacy.distance_km ?? 0).toFixed(1)} km away
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <p className="text-sm font-semibold text-primary">
                      ₦{(pharmacy.price || 0).toLocaleString()}
                    </p>
                    <span className={cn(
                      "text-[9px] font-medium px-1.5 py-0.2 rounded uppercase tracking-wide inline-block",
                      pharmacy.stock_status === 'in_stock' 
                        ? 'bg-emerald-500/10 text-emerald-600' 
                        : 'bg-amber-500/10 text-amber-600'
                    )}>
                      {(pharmacy.stock_status || 'in_stock').replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}