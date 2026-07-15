"use client"

import { useEffect, useState } from "react"
import { 
  ShieldAlert, 
  Phone, 
  MapPin, 
  Loader2, 
  Navigation, 
  Activity, 
  ArrowUpRight,
  ChevronRight,
  Info
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { HealthFacility } from "@/lib/api/types"

export default function EmergencyPage() {
  const [facilities, setFacilities] = useState<HealthFacility[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const lat = localStorage.getItem("user_lat") || "9.0578"
    const lng = localStorage.getItem("user_lng") || "7.4951"

    fetch(`/api/v1/facilities/emergency?lat=${lat}&lng=${lng}&radius_km=20`)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data: HealthFacility[]) => {
        setFacilities(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        setFacilities([])
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/40 via-white to-white pt-24 md:pt-28 lg:pt-32 pb-20 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Dynamic Non-Template Header */}
        <div className="relative overflow-hidden rounded-3xl bg-rose-950 p-6 sm:p-8 text-white shadow-[0_12px_40px_rgba(159,18,57,0.15)]">
          {/* Subtle Background Artistry */}
          <div className="absolute right-0 top-0 -mr-16 -mt-16 size-48 rounded-full bg-rose-600/10 blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-xs font-bold text-rose-300 tracking-wider uppercase">
                <Activity className="size-3 text-rose-400 animate-pulse" />
                <span>Live Abuja Dispatch</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none text-white">
                Trauma & Emergency
              </h1>
              <p className="text-rose-200/80 text-sm font-medium max-w-md">
                Locate verified 24-hour ER counters, life support units, and active FCT general hospitals.
              </p>
            </div>
            
            <div className="flex items-center justify-center size-14 sm:size-16 bg-rose-600 rounded-2xl shadow-[0_8px_20px_rgba(225,29,72,0.3)] animate-pulse shrink-0">
              <ShieldAlert className="size-8 text-white" />
            </div>
          </div>
        </div>

        {/* Sticky/Prominent FCT General Emergency Contacts (Immediate Action Block) */}
        <Card className="border-rose-100 bg-rose-50/40 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white border border-rose-100 rounded-xl text-rose-600 shrink-0 mt-0.5">
              <Info className="size-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-bold text-slate-900 text-sm">FCT Emergency Toll-Free Dispatch</h4>
              <p className="text-xs text-slate-500 font-medium">Direct connection to National Emergency Management and First Responders.</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button size="sm" variant="outline" className="flex-1 sm:flex-none h-10 border-slate-200 rounded-xl font-bold bg-white active:scale-95 text-slate-700">
              <a href="tel:112">
                <Phone className="size-3.5 mr-2 text-slate-500" />
                <span>Call 112</span>
              </a>
            </Button>
            <Button size="sm" className="flex-1 sm:flex-none h-10 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-sm active:scale-95">
              <a href="tel:08000225563">
                <Phone className="size-3.5 mr-2" />
                <span>NEMA Hotline</span>
              </a>
            </Button>
          </div>
        </Card>

        {/* Core Listings Portal */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">
              {loading ? "Searching..." : `Nearest Active Units (${facilities.length})`}
            </h3>
            {!loading && facilities.length > 0 && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                Verified Active
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
              <Loader2 className="animate-spin text-rose-600 size-8" />
              <p className="text-sm font-bold text-slate-600 tracking-wide uppercase">Mapping FCT Trauma Units...</p>
              <p className="text-xs text-slate-400">Verifying real-time operational status</p>
            </div>
          ) : facilities.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-16 text-center bg-white border-slate-100 rounded-[2rem] shadow-sm">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 mb-4">
                <ShieldAlert className="h-7 w-7" />
              </div>
              <p className="font-bold text-slate-800 text-lg">No 24-Hour Stations Near You</p>
              <p className="text-sm text-slate-400 max-w-sm mt-1 leading-relaxed">
                We couldn't detect any active 24-hour emergency wards within a 20km radius of your current FCT coordinates.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {facilities.map((facility, index) => {
                const isNearest = index === 0 && (facility.distance_km ?? 99) < 5
                
                // FIXED REDIRECT QUERY: Using the highly descriptive query parameters to let Google Search resolve locations perfectly.
                const mapSearchQuery = encodeURIComponent(
                  `${facility.name}, ${facility.area_council || "Abuja"}, Abuja, FCT, Nigeria`
                )
                const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${mapSearchQuery}`

                return (
                  <Card 
                    key={facility.id} 
                    className={`group relative overflow-hidden p-5 sm:p-6 transition-all duration-300 rounded-[2rem] border ${
                      isNearest 
                        ? "border-rose-300 bg-rose-50/10 shadow-[0_12px_30px_rgba(244,63,94,0.06)]" 
                        : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-md"
                    }`}
                  >
                    {isNearest && (
                      <span className="absolute top-0 right-0 bg-rose-600 text-white font-extrabold text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl">
                        Closest Dispatch
                      </span>
                    )}

                    <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between">
                      {/* Left Block: Critical Details */}
                      <div className="space-y-2.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight leading-snug group-hover:text-rose-600 transition-colors">
                            {facility.name}
                          </h3>
                          <Badge variant="outline" className="capitalize text-[10px] font-bold text-rose-700 bg-rose-50 border-rose-100 rounded-full px-2.5 py-0.5">
                            {facility.facility_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-start gap-1.5">
                          <MapPin className="size-4 shrink-0 text-slate-400 mt-0.5" /> 
                          <span className="line-clamp-2 leading-relaxed">
                            {facility.address || `${facility.area_council || "FCT"}, Abuja`}
                          </span>
                        </p>

                        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-bold pt-1.5">
                          {facility.distance_km !== undefined && (
                            <div className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                              <Navigation className="size-3 text-emerald-500 animate-pulse" /> 
                              <span>{facility.distance_km.toFixed(1)} km away</span>
                            </div>
                          )}
                          <span className="text-slate-400">
                            Council: <strong className="text-slate-600">{facility.area_council || "FCT Core"}</strong>
                          </span>
                          {facility.accepts_nhis && (
                            <span className="text-slate-400">
                              Insurance: <strong className="text-emerald-600">NHIS Accepted</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Block: Thumb-Friendly Immediate Action Triggers */}
                      <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t border-slate-100 md:border-t-0">
                        {/* Get Directions (Google Maps via Query API) */}
                        <Button 
                          variant="outline" 
                          className="flex-1 md:flex-none h-12 px-5 rounded-2xl gap-2 font-bold text-xs tracking-wide uppercase border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm active:scale-95 transition-all"
                        >
                          <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                            <Navigation className="size-4 text-slate-500" />
                            <span>Navigate</span>
                            <ArrowUpRight className="size-3 opacity-50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                          </a>
                        </Button>

                        {/* Call Desk Counter */}
                        {facility.phone && (
                          <Button 
                            className="flex-1 md:flex-none h-12 px-6 rounded-2xl gap-2 font-bold text-xs tracking-wide uppercase bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/10 active:scale-95 transition-all"
                          >
                            <a href={`tel:${facility.phone}`}>
                              <Phone className="size-4" />
                              <span>Call Desk</span>
                              <ChevronRight className="size-3.5 opacity-80" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}