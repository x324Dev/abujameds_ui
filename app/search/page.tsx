'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { useDrugSearch, usePartnerPharmacies } from '@/hooks/api'
import { PharmacyResultCard } from '@/components/patient/pharmacy-result-card'
import { Search, Pill, MapPin, Loader2, AlertCircle } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce' 
import { PharmacySearchResult } from '@/lib/api/types'

export default function DrugSearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDrug, setSelectedDrug] = useState<{ id: string; name: string } | null>(null)
  
  const debouncedQuery = useDebounce(searchQuery, 300)

  // 1. Fetch matching drugs based on user query input
  const { data: searchResults, isLoading: searchLoading } = useDrugSearch(debouncedQuery)

  // 2. Fetch partner facilities holding verified allocations of the chosen item
  const { data: pharmacies, isLoading: pharmaciesLoading, error: pharmaciesError } = usePartnerPharmacies(
    selectedDrug?.name || undefined
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-left space-y-8 animate-in fade-in duration-200">
      
      {/* Search Input Module */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-foreground">Prescription & Stock Finder</h1>
        <p className="text-sm text-muted-foreground">
          Locate authentic medications across verified network pharmacies instantly.
        </p>
        <div className="relative max-w-2xl mt-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by drug name, chemical formulation, or NAFDAC registry number..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (selectedDrug) setSelectedDrug(null) // Reset detail cards on new queries
            }}
            className="pl-10 h-11 border-border bg-card shadow-sm rounded-xl focus-visible:ring-primary"
          />
          {searchLoading && (
            <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Drug Match Results */}
        <div className="md:col-span-1 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Matching Registrations</h3>
          
          {debouncedQuery === '' ? (
            <div className="p-4 border border-dashed rounded-xl text-center text-xs text-muted-foreground">
              Begin typing to query matching items.
            </div>
          ) : (
            (() => {
              // Normalize searchResults.drug to an array for safe mapping
              const drugs = Array.isArray(searchResults?.drug)
                ? searchResults!.drug
                : searchResults?.drug
                ? [searchResults.drug]
                : []

              if (drugs.length === 0) {
                return (
                  <div className="p-4 border rounded-xl text-center text-xs text-muted-foreground bg-muted/30">
                    No registered medications match your query parameters.
                  </div>
                )
              }

              return drugs.map((drug: any) => (
                <button
                  key={drug.id}
                  onClick={() => setSelectedDrug({ id: drug.id, name: drug.name })}
                  className={`w-full text-left p-3.5 border rounded-xl transition-all flex items-start gap-3 shadow-sm ${
                    selectedDrug?.id === drug.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border bg-card hover:border-muted-foreground/30'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${selectedDrug?.id === drug.id ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Pill className="size-4" />
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <h4 className="text-sm font-bold text-foreground truncate">{drug.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{drug.manufacturer || 'Verified Registry Item'}</p>
                    <p className="text-[10px] inline-block font-mono bg-muted px-1.5 py-0.5 rounded text-foreground/80 mt-1">
                      {drug.nafdac_number}
                    </p>
                  </div>
                </button>
              ))
            })()
          )}
        </div>

        {/* Right Column: Pharmacy Stock & Actions Matrix */}
        <div className="md:col-span-2 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
            Available Stock Locations {selectedDrug && `for ${selectedDrug.name}`}
          </h3>

          {!selectedDrug ? (
            <div className="p-12 border border-dashed rounded-xl bg-muted/10 text-center space-y-2">
              <MapPin className="size-6 text-muted-foreground/60 mx-auto" />
              <p className="text-sm font-medium text-muted-foreground">Select a medication registry line to view real-time pharmacy allocations.</p>
            </div>
          ) : pharmaciesLoading ? (
            <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Loader2 className="size-5 animate-spin text-primary" />
              <span>Querying telemetry data hooks...</span>
            </div>
          ) : pharmaciesError ? (
            <div className="p-4 border border-destructive/20 rounded-xl bg-destructive/5 text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0" />
              <span>Failed to fetch regional partner allocations.</span>
            </div>
          ) : pharmacies?.length === 0 ? (
            <div className="p-8 border rounded-xl bg-muted/20 text-center text-sm text-muted-foreground">
              Out of stock across your regional network. Try broadening your radius metrics.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pharmacies?.map((pharmacy: PharmacySearchResult) => (
                <PharmacyResultCard
                  // FIXED: Changed fields to map with the correct properties from PharmacySearchResult
                  key={pharmacy.pharmacy_id || pharmacy.pharmacy_name}
                  result={pharmacy}
                  drugName={selectedDrug.name}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}