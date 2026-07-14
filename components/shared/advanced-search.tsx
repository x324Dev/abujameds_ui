'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { formatNaira } from '@/lib/format'
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  Building2,
  DollarSign
} from 'lucide-react'

interface SearchResultItem {
  id: string
  drug_name: string
  brand_name: string
  price: number
  distance_km: number
  facility_name: string
  is_pcn_verified: boolean
  stock_status: string
}

interface PaginatedResponse {
  items: SearchResultItem[]
  total_count: number
  page: number
  pages: number
}

export function AdvancedSearchDashboard() {
  // Core Query State
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [radiusKm, setRadiusKm] = useState('10')
  const [sortBy, setSortBy] = useState('distance') // 'distance' | 'price'
  const [pcnOnly, setPcnOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Construct URL query parameters directly mapped to FastAPI criteria
  const queryParams = new URLSearchParams({
    query: query.trim(),
    page: page.toString(),
    limit: '10',
    radius_km: radiusKm,
    sort_by: sortBy,
    pcn_only: pcnOnly.toString()
  })

  // Only trigger backend fetch if the user types a search target
  const shouldFetch = query.trim().length >= 2
  const { data, error, isLoading } = useSWR<PaginatedResponse>(
    shouldFetch ? `/api/v1/search?${queryParams.toString()}` : null,
    fetcher,
    { keepPreviousData: true, revalidateOnFocus: false }
  )

  // Reset to page 1 whenever filters change to prevent empty index results
  useEffect(() => {
    setPage(1)
  }, [radiusKm, sortBy, pcnOnly, query])

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto px-4 py-6">
      {/* 1. Main Search Entry Bar */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by generic or brand name (e.g., Artemether, Insulin)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11 bg-background border-border"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
            className={`h-11 gap-2 border-border ${showFilters ? 'bg-muted border-primary/40' : ''}`}
          >
            <SlidersHorizontal className="size-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        </div>

        {/* 2. Expandable Filter Deck */}
        {showFilters && (
          <Card className="p-4 border-border bg-card shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Radius Configuration */}
              <div className="space-y-1.5">
                <Label htmlFor="radius" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Proximity Radius</Label>
                <select
                  id="radius"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="5">Within 5 km</option>
                  <option value="10">Within 10 km</option>
                  <option value="25">Within 25 km</option>
                  <option value="50">Entire Abuja (50 km)</option>
                </select>
              </div>

              {/* Sorting Strategies */}
              <div className="space-y-1.5">
                <Label htmlFor="sort" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prioritize Results</Label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="distance">Closest Distance</option>
                  <option value="price">Cheapest Price</option>
                </select>
              </div>

              {/* Regulatory Verification Flag */}
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="pcn"
                  checked={pcnOnly}
                  onChange={(e) => setPcnOnly(e.target.checked)}
                  className="size-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary cursor-pointer"
                />
                <Label htmlFor="pcn" className="text-sm font-medium text-foreground cursor-pointer flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-sky-600" /> Only PCN-Verified Stores
                </Label>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* 3. Query Execution & Error UI Blocks */}
      {isLoading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
          <Loader2 className="size-5 animate-spin text-primary" />
          <span className="text-sm">Scanning available pharmacy allocation inventories...</span>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          Failed to compute geospatial pharmacy matches. Please confirm location data permissions.
        </p>
      )}

      {/* 4. Results List Render */}
      {shouldFetch && data && !isLoading && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Found {data.total_count} matching stock configurations in your area
          </p>

          <div className="space-y-3">
            {data.items.map((item) => (
              <Card key={item.id} className="p-4 border-border bg-card shadow-sm hover:border-primary/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-foreground">{item.drug_name}</h3>
                    {item.brand_name && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border">
                        {item.brand_name}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1 font-medium text-foreground/90">
                      <Building2 className="size-3.5 text-muted-foreground" /> {item.facility_name}
                    </span>
                    {item.is_pcn_verified && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-sky-50 text-sky-700 border border-sky-100 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/40">
                        PCN Verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-muted">
                  <div className="text-left sm:text-right space-y-0.5">
                    <div className="text-sm font-medium text-muted-foreground flex items-center sm:justify-end gap-1">
                      <MapPin className="size-3.5 text-primary" /> {item.distance_km.toFixed(1)} km away
                    </div>
                    <div className="text-lg font-extrabold text-foreground flex items-center sm:justify-end">
                      {formatNaira(item.price)}
                    </div>
                  </div>
                  <Button size="sm" className="shadow-sm font-medium">Reserve Hold</Button>
                </div>
              </Card>
            ))}

            {data.items.length === 0 && (
              <div className="text-center p-8 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/10">
                No medication distribution listings match your strict filter settings. Try broadening your lookup radius.
              </div>
            )}
          </div>

          {/* 5. Pagination Control Triggers */}
          {data.pages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
              <span className="text-xs text-muted-foreground font-medium">
                Showing page <span className="text-foreground font-bold">{page}</span> of {data.pages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border size-8 p-0"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border size-8 p-0"
                  disabled={page === data.pages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}