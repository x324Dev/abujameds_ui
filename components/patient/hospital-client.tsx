"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { 
  Hospital, 
  Phone, 
  MapPin, 
  Search, 
  Ambulance, 
  Loader2, 
  Map as MapIcon, 
  List as ListIcon, 
  Navigation,
  Activity,
  X 
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { MapView, type MapMarker, type MarkerKind } from "@/components/map/map-view"
import { fetcher } from "@/lib/fetcher"
import { formatDistance } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { HealthFacility } from "@/lib/api/types"

export function HospitalClient({ specialization }: { specialization?: string }) {
  const [query, setQuery] = useState("")
  const [emergencyOnly, setEmergencyOnly] = useState(false)
  const [mobileView, setMobileView] = useState<"list" | "map">("list")
  const [activeId, setActiveId] = useState<string | null>(null)
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

  // 1. DYNAMIC API ROUTE SELECTION
  const baseEndpoint = emergencyOnly 
    ? "/api/v1/facilities/emergency" 
    : specialization
      ? "/api/v1/facilities/hospitals/by-specialisation"
      : "/api/v1/facilities/search"
    
  const params = new URLSearchParams()
  params.set("lat", coords.lat)
  params.set("lng", coords.lng)

  if (specialization) {
    params.set("specialisation", specialization)
  }
  
  if (emergencyOnly) {
    params.set("radius_km", "20")
  } else if (query.trim()) {
    params.set("q", query.trim())
  }

  // 2. INSTANT RETRIEVAL GUARD ON SPECIALIZATION CLICK
  const shouldFetch = emergencyOnly || !!specialization || query.trim().length >= 2
  const fetchUrl = shouldFetch ? `${baseEndpoint}?${params.toString()}` : null

  const { data, error, isLoading } = useSWR<HealthFacility[]>(
    fetchUrl,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 6000,
    }
  )

  const hospitals = Array.isArray(data) ? data : []

  // TypeScript-Safe Coordinate Mapping
  const markers: MapMarker[] = hospitals
    .filter(
      (h): h is typeof h & { latitude: number; longitude: number } =>
        typeof h.latitude === "number" &&
        typeof h.longitude === "number" &&
        !isNaN(h.latitude) &&
        !isNaN(h.longitude)
    )
    .map((h) => {
      const hasEmergencyCapability = h.services?.includes("24_hour_emergency")
      return {
        id: h.id,
        lat: h.latitude,
        lng: h.longitude,
        kind: (hasEmergencyCapability || emergencyOnly ? "emergency" : "hospital") as MarkerKind,
        label: h.name,
        sublabel: h.address || (h.area_council ? `${h.area_council}, Abuja` : 'Abuja, FCT'),
      }
    })

  return (
    // 3. REMOVED EXCESS TOP PADDING (NOW DELEGATED TO PARENT)
    // <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-6 pb-8">
     <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-24 md:pt-28 lg:pt-32 pb-8"> 
      {/* Dynamic Sub-Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] font-bold text-emerald-800 tracking-wider uppercase">
            <Activity className="size-3 text-emerald-500 animate-pulse" />
            <span>FCT Health Registry</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Health Facilities</h1>
          <p className="text-sm text-slate-500 font-medium">
            Locate verified public/private hospitals, specialized clinics, and emergency centers in Abuja.
          </p>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex lg:hidden bg-slate-100/80 p-1 rounded-xl w-full sm:w-auto shrink-0 border border-slate-200/40">
          <button
            onClick={() => setMobileView("list")}
            className={cn(
              "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer",
              mobileView === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <ListIcon className="size-3.5" />
            <span>List View ({hospitals.length})</span>
          </button>
          <button
            onClick={() => setMobileView("map")}
            className={cn(
              "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer",
              mobileView === "map" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <MapIcon className="size-3.5" />
            <span>Interactive Map</span>
          </button>
        </div>
      </div>

      {/* Action Bars */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 group">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by hospital name, specialty, or area (e.g., Garki, Wuse)..."
            className="h-12 pl-11 pr-10 bg-white border-slate-200/80 rounded-2xl shadow-sm focus-visible:ring-4 focus-visible:ring-emerald-500/5 focus-visible:border-emerald-500/30 font-medium placeholder:text-slate-400 text-slate-800"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-0.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              aria-label="Clear search input"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <Button
          type="button"
          variant={emergencyOnly ? "destructive" : "outline"}
          className={cn(
            "h-12 px-5 rounded-2xl gap-2.5 shrink-0 font-bold transition-all border-slate-200 active:scale-95",
            emergencyOnly 
              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/10 border-transparent" 
              : "bg-white hover:bg-slate-50 text-slate-700"
          )}
          onClick={() => setEmergencyOnly((v) => !v)}
          aria-pressed={emergencyOnly}
        >
          <Ambulance className={cn("h-4.5 w-4.5", emergencyOnly && "animate-pulse")} />
          <span>Emergency Stations Only</span>
        </Button>
      </div>

      {/* Main Splitscreen Portal */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px]">
        
        {/* Left Column: Cards List */}
        <div className={cn("flex flex-col gap-4", mobileView === "list" ? "flex" : "hidden lg:flex")}>
          {!emergencyOnly && !specialization && query.trim().length > 0 && query.trim().length < 2 && (
            <Card className="p-4 text-xs font-semibold text-center text-slate-500 bg-slate-50 border-slate-100 rounded-2xl">
              Type at least 2 characters or select a specialization to search.
            </Card>
          )}

          {error && (
            <Card className="p-6 border-rose-100 bg-rose-50/50 text-rose-700 text-sm font-semibold text-center rounded-2xl">
              Failed to load healthcare facilities. Please verify your connection and try again.
            </Card>
          )}

          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="space-y-2.5 w-2/3">
                    <Skeleton className="h-5 w-full rounded-md" />
                    <Skeleton className="h-4 w-5/6 rounded-md" />
                  </div>
                  <Skeleton className="size-10 rounded-full" />
                </div>
                <Skeleton className="h-3.5 w-24 rounded-md mt-2" />
              </div>
            ))
          ) : !shouldFetch ? (
            <Card className="flex flex-col items-center justify-center p-16 text-center bg-white border-slate-100 rounded-[2rem] shadow-sm">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 mb-4 animate-pulse">
                <Hospital className="h-7 w-7" />
              </div>
              <p className="font-bold text-slate-800 text-lg">Search Abuja Facilities</p>
              <p className="text-sm text-slate-400 max-w-xs mt-1 leading-relaxed">
                Choose a medical specialization filter above, search by keywords, or toggle emergency stations.
              </p>
            </Card>
          ) : hospitals.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-16 text-center bg-white border-slate-100 rounded-[2rem] shadow-sm">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 mb-4">
                <Hospital className="h-7 w-7" />
              </div>
              <p className="font-bold text-slate-800 text-lg">No facilities found</p>
              <p className="text-sm text-slate-400 max-w-sm mt-1 leading-relaxed">
                {emergencyOnly 
                  ? "No emergency stations matched this filter." 
                  : "We couldn't find matches. Double-check your spelling or try switching specializations."}
              </p>
            </Card>
          ) : (
            hospitals.map((h) => {
              const hasEmergencyCapability = h.services?.includes("24_hour_emergency")
              const isSelected = activeId === h.id
              
              return (
                <Card
                  key={h.id}
                  onClick={() => {
                    setActiveId(h.id)
                    if (window.innerWidth < 1024) {
                      setMobileView("map")
                    }
                  }}
                  className={cn(
                    "animate-in fade-in-50 slide-in-from-bottom-2 duration-300 p-5 cursor-pointer transition-all hover:translate-y-[-2px] border rounded-2xl",
                    isSelected 
                      ? "border-emerald-500/80 bg-emerald-50/10 ring-1 ring-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.08)]" 
                      : "border-slate-100 bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-bold text-slate-900 text-base md:text-lg tracking-tight leading-none">
                          {h.name}
                        </h2>
                        {hasEmergencyCapability && (
                          <Badge className="gap-1 bg-rose-500/10 text-rose-700 border-transparent hover:bg-rose-500/10 pointer-events-none rounded-full text-[10px] font-bold">
                            <Ambulance className="h-3 w-3" /> 24/7 ER
                          </Badge>
                        )}
                        <Badge variant="outline" className="capitalize text-[10px] font-bold text-slate-500 border-slate-200/80 rounded-full px-2.5 py-0.5">
                          {h.facility_type?.replace('_', ' ') || 'General'}
                        </Badge>
                      </div>
                      
                      <p className="flex items-center gap-1.5 text-xs md:text-sm text-slate-500 font-medium">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">
                          {h.address || (h.area_council ? `${h.area_council}, Abuja` : 'Abuja, FCT')}
                        </span>
                      </p>
                      
                      {typeof h.distance_km === "number" && (
                        <div className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                          <Navigation className="size-3 text-emerald-500" />
                          <span>{formatDistance(h.distance_km)} away</span>
                        </div>
                      )}
                    </div>
                    
                    {h.phone && (
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="shrink-0 size-11 rounded-full border-slate-200/80 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer active:scale-95"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a href={`tel:${h.phone}`} aria-label={`Call medical desk at ${h.name}`}>
                          <Phone className="h-4 w-4 text-slate-500" />
                        </a>
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })
          )}
        </div>

        {/* Right Column: Sticky Interactive Map */}
        <div className={cn(
          "lg:sticky lg:top-32 h-[50vh] sm:h-[60vh] lg:h-[680px] xl:h-[750px]",
          mobileView === "map" ? "block" : "hidden lg:block"
        )}>
          <Card className="h-full overflow-hidden p-0 border-slate-200/60 bg-white shadow-sm rounded-3xl relative">
            {isLoading ? (
              <div className="flex h-full items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
                  <span className="text-xs text-slate-400 font-bold tracking-wider uppercase">Loading Map Assets...</span>
                </div>
              </div>
            ) : (
              <MapView 
                markers={markers} 
                activeId={activeId}
                onMarkerClick={(id) => setActiveId(id)}
                className="h-full w-full" 
              />
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}