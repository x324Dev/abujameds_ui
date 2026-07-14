"use client"

import { useEffect, useState } from "react"
import { ShieldAlert, Phone, Compass, MapPin, Loader2, Link2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { HealthFacility } from "@/lib/api/types"

export default function EmergencyPage() {
  const [facilities, setFacilities] = useState<HealthFacility[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Collect local variables to feed target geo bounds parameters safely
    const lat = localStorage.getItem("user_lat") || "9.0578"
    const lng = localStorage.getItem("user_lng") || "7.4951"

    fetch(`/api/v1/facilities/emergency?lat=${lat}&lng=${lng}&radius_km=20`)
      .then((res) => {
        if (!res.ok) throw new Error()
        return res.json()
      })
      .then((data: HealthFacility[]) => {
        // Safe check: assign directly if server delivers an array list
        setFacilities(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        setFacilities([])
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-rose-50/30 pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-4 bg-rose-100 rounded-3xl text-rose-600 animate-pulse shadow-inner">
            <ShieldAlert className="size-9" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Emergency Healthcare Port</h1>
          <p className="text-slate-500 max-w-md mx-auto text-sm">
            Displaying active 24-Hour facilities matching current location validation queries.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Loader2 className="animate-spin text-rose-600 size-8" />
            <p className="text-sm font-medium text-slate-500">Syncing with FCT Trauma Units...</p>
          </div>
        ) : facilities.length === 0 ? (
          <p className="text-center py-12 text-slate-400 text-sm">No 24-hour emergency channels located within radius limits.</p>
        ) : (
          <div className="space-y-3">
            {facilities.map((facility) => (
              <Card key={facility.id} className="p-5 border-rose-100/70 shadow-sm rounded-3xl bg-white flex justify-between items-center gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-lg truncate">{facility.name}</h3>
                    <span className="bg-rose-50 border border-rose-100 text-rose-700 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                      {facility.facility_type.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-500 flex items-center gap-1 truncate">
                    <MapPin className="size-3.5 shrink-0 text-slate-400" /> {facility.address}
                  </p>

                  <div className="flex gap-3 text-xs text-slate-400 pt-1 font-medium">
                    {facility.distance_km !== undefined && (
                      <span className="flex items-center gap-0.5 text-slate-600">
                        <Compass className="size-3" /> {facility.distance_km.toFixed(1)} km away
                      </span>
                    )}
                    <span>Council: <strong className="text-slate-600">{facility.area_council || "FCT Core"}</strong></span>
                    {facility.accepts_nhis && (
                      <span className="text-emerald-600 font-semibold bg-emerald-50 px-1 rounded">NHIS Approved</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {facility.external_url && (
                    <Button variant="outline" size="icon" className="rounded-full size-11 shrink-0">
                      <a href={facility.external_url} target="_blank" rel="noopener noreferrer">
                        <Link2 className="size-4 text-slate-600" />
                      </a>
                    </Button>
                  )}
                  {facility.phone && (
                    <Button size="icon" className="rounded-full size-11 bg-rose-600 hover:bg-rose-700 shadow-sm shrink-0">
                      <a href={`tel:${facility.phone}`}>
                        <Phone className="size-4 text-white" />
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}