"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Hospital, Phone, MapPin, Search, Ambulance, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MapView } from "@/components/map/map-view"
import { fetcher } from "@/lib/fetcher"
import { formatDistance } from "@/lib/format"
import type { HealthFacility } from "@/lib/api/types"

export function HospitalClient({ specialization }: { specialization?: string }) {
  const [query, setQuery] = useState("")
  const [emergencyOnly, setEmergencyOnly] = useState(false)
  
  // Coordinates state to handle location-aware distance calculations from the backend
  const [coords, setCoords] = useState({ lat: "9.0578", lng: "7.4951" })

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLat = localStorage.getItem("user_lat")
      const savedLng = localStorage.getItem("user_lng")
      if (savedLat && savedLng) {
        setCoords({ lat: savedLat, lng: savedLng })
      }
    }
  }, [])

  // Determine endpoint and query parameters strictly aligned with backend guidelines
  const baseEndpoint = emergencyOnly 
    ? "/api/v1/facilities/emergency" 
    : "/api/v1/facilities/search"
    
  const params = new URLSearchParams()
  params.set("lat", coords.lat)
  params.set("lng", coords.lng)

  if (specialization) {
    params.set("specialisation", specialization) // Bind to backend specialization router
  } else if (emergencyOnly) {
    params.set("radius_km", "20")
  } else if (query.trim()) {
    params.set("q", query.trim())
  }

  if (emergencyOnly) {
    params.set("radius_km", "20")
  } else if (query.trim()) {
    params.set("q", query.trim())
  }

  // Handle backend validation: search endpoint requires at least 2 characters when not fetching emergency
  const shouldFetch = emergencyOnly || query.trim().length >= 2
  const fetchUrl = shouldFetch ? `${baseEndpoint}?${params.toString()}` : null

  // Backend returns a flat array of HealthFacility[] directly
  const { data, error, isLoading } = useSWR<HealthFacility[]>(
    fetchUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 6000,
    }
  )

  const hospitals = Array.isArray(data) ? data : []

  const markers = hospitals.map((h) => {
    const hasEmergencyCapability = h.services?.includes("24_hour_emergency")
    return {
      id: h.id,
      lat: h.latitude,
      lng: h.longitude,
      label: h.name,
      tone: (hasEmergencyCapability || emergencyOnly ? "destructive" : "teal") as "destructive" | "teal",
    }
  })

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-balance text-2xl font-bold tracking-tight">Find a healthcare facility</h1>
        <p className="text-sm text-muted-foreground">Locate hospitals, clinics, and emergency centers across the FCT.</p>
      </div>

      {/* Control Actions Bar */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by hospital name, specialty, or area (e.g., Garki, Wuse)..."
            className="h-11 pl-9 bg-card"
          />
        </div>
        <Button
          type="button"
          variant={emergencyOnly ? "destructive" : "outline"}
          className="h-11 gap-2 shrink-0 transition-colors"
          onClick={() => setEmergencyOnly((v) => !v)}
          aria-pressed={emergencyOnly}
        >
          <Ambulance className="h-4 w-4" />
          <span>Emergency only (24/7 ER)</span>
        </Button>
      </div>

      {/* Core Dynamic Content Body Split */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_minmax(0,420px)]">
        <div className="flex flex-col gap-3">
          {!emergencyOnly && query.trim().length > 0 && query.trim().length < 2 && (
            <Card className="p-4 text-sm text-center text-muted-foreground bg-slate-50">
              Please enter at least 2 characters to initiate facility search index.
            </Card>
          )}

          {error && (
            <Card className="p-6 border-destructive/20 bg-destructive/5 text-destructive text-sm text-center">
              Failed to load healthcare facilities. Please verify your connection and try again.
            </Card>
          )}

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))
          ) : shouldFetch && hospitals.length === 0 ? (
            <Card className="flex flex-col items-center gap-2 p-12 text-center bg-card">
              <Hospital className="h-8 w-8 text-muted-foreground/60" />
              <p className="font-medium text-foreground">No facilities matching criteria</p>
              <p className="text-sm text-muted-foreground max-w-xs">
                {emergencyOnly 
                  ? "No 24-hour emergency stations found for this query in Abuja." 
                  : "Try loosening your keywords or checking your spelling."}
              </p>
            </Card>
          ) : (
            hospitals.map((h) => {
              const hasEmergencyCapability = h.services?.includes("24_hour_emergency")
              
              return (
                <Card
                  key={h.id}
                  className="animate-in fade-in-50 duration-200 p-5 transition-all hover:shadow-md border-border bg-card"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-foreground text-base tracking-tight">{h.name}</h2>
                        {hasEmergencyCapability && (
                          <Badge className="gap-1 bg-destructive/10 text-destructive border-transparent hover:bg-destructive/10 pointer-events-none">
                            <Ambulance className="h-3 w-3" /> 24/7 ER
                          </Badge>
                        )}
                        <Badge variant="outline" className="capitalize text-xs font-normal">
                          {h.facility_type?.replace('_', ' ') || 'General'}
                        </Badge>
                      </div>
                      
                      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                        <span className="truncate">{h.address || (h.area_council ? `${h.area_council}, Abuja` : 'Abuja, FCT')}</span>
                      </p>
                      
                      {typeof h.distance_km === "number" && (
                        <p className="mt-1.5 text-xs font-semibold text-primary">
                          {formatDistance(h.distance_km)} away
                        </p>
                      )}
                    </div>
                    
                    {h.phone && (
                      /* FIXED: Replaced asChild with Base UI's render layout pattern */
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="shrink-0 rounded-xl"
                        render={
                          <a href={`tel:${h.phone}`} aria-label={`Call medical desk at ${h.name}`} />
                        }
                      >
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })
          )}
        </div>

        {/* Floating Context Map Layout */}
        <div className="lg:sticky lg:top-24 lg:h-[calc(100dvh-8rem)]">
          <Card className="h-72 overflow-hidden p-0 lg:h-full border-border bg-card shadow-sm rounded-2xl">
            {isLoading ? (
              <div className="flex h-full items-center justify-center bg-muted/20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <MapView markers={markers as any[]} className="h-full w-full" />
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}