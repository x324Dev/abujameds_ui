'use client'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { Navigation } from 'lucide-react'

export type MarkerKind = 'pharmacy' | 'hospital' | 'partner' | 'emergency'

export interface MapMarker {
  id: string
  lat: number
  lng: number
  kind: MarkerKind
  label: string
  sublabel?: string
}

const COLORS: Record<MarkerKind, string> = {
  pharmacy: '#10B981', // Emerald-500
  hospital: '#0F766E', // Teal-700
  partner: '#D97706',  // Amber-600
  emergency: '#E11D48', // Rose-600
}

function MapRecenter({ center }: { center?: [number, number] }) {
  const map = useMap()
  
  useEffect(() => {
    if (!center || typeof center[0] !== 'number' || typeof center[1] !== 'number' || isNaN(center[0]) || isNaN(center[1])) {
      return
    }

    try {
      const currentCenter = map.getCenter()
      if (!currentCenter || isNaN(currentCenter.lat) || isNaN(currentCenter.lng)) {
        map.setView(center, 15)
      } else {
        map.flyTo(center, 15, {
          animate: true,
          duration: 1.2,
        })
      }
    } catch (error) {
      console.error("Leaflet cinematic pan failed:", error)
      map.setView(center, 15)
    }
  }, [center, map])
  
  return null
}

function markerHtml(kind: MarkerKind) {
  const color = COLORS[kind]
  const pulse =
    kind === 'emergency'
      ? `<span style="position:absolute;inset:-6px;border-radius:9999px;background:${color};opacity:0.3;animation:emergency-pulse 2s infinite;"></span>`
      : ''

  if (kind === 'hospital' || kind === 'emergency') {
    return `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:28px;height:28px;">${pulse}
      <span style="position:relative;display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:${color};box-shadow:0 2px 8px rgba(0,0,0,0.2);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </span></div>`
  }
  if (kind === 'partner') {
    return `<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:6px;background:${color};box-shadow:0 2px 8px rgba(0,0,0,0.2);border:2px solid white;"></div>`
  }
  return `<div style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:9999px;background:${color};box-shadow:0 2px 8px rgba(0,0,0,0.2);border:2px solid white;"></div>`
}

function icon(kind: MarkerKind) {
  return L.divIcon({
    html: markerHtml(kind),
    className: 'am-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -10],
  })
}

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap()
  
  useEffect(() => {
    const validMarkers = (markers || []).filter(
      (m) => m && typeof m.lat === 'number' && typeof m.lng === 'number' && !isNaN(m.lat) && !isNaN(m.lng)
    )

    if (validMarkers.length === 0) return
    
    if (validMarkers.length === 1) {
      map.setView([validMarkers[0].lat, validMarkers[0].lng], 14)
      return
    }
    
    try {
      const bounds = L.latLngBounds(validMarkers.map((m) => [m.lat, m.lng]))
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    } catch (e) {
      console.error("Could not complete automatic fitBounds calculation:", e)
    }
  }, [markers, map])
  
  return null
}

export default function LeafletMap({
  markers,
  center,
  activeId,
  onMarkerClick,
  className,
}: {
  markers: MapMarker[]
  center?: [number, number]
  activeId?: string | null
  onMarkerClick?: (id: string) => void
  className?: string
}) {
  const markerRefs = useRef<Record<string, L.Marker>>({})

  const icons = useMemo(
    () => ({
      pharmacy: icon('pharmacy'),
      hospital: icon('hospital'),
      partner: icon('partner'),
      emergency: icon('emergency'),
    }),
    [],
  )

  const safeInitialCenter = useMemo<[number, number]>(() => {
    if (center && typeof center[0] === 'number' && typeof center[1] === 'number' && !isNaN(center[0]) && !isNaN(center[1])) {
      return center
    }
    return [9.0765, 7.4854] // Abuja default
  }, [center])

  const safeMarkers = useMemo(() => {
    return (markers || []).filter(
      (m) => m && typeof m.lat === 'number' && typeof m.lng === 'number' && !isNaN(m.lat) && !isNaN(m.lng)
    )
  }, [markers])

  // Triggers active map popups programmatically when clicking listing cards
  useEffect(() => {
    if (activeId && markerRefs.current[activeId]) {
      markerRefs.current[activeId].openPopup()
    }
  }, [activeId, safeMarkers])

  return (
    <MapContainer
      center={safeInitialCenter}
      zoom={12}
      zoomControl={false}
      scrollWheelZoom
      className={className}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      
      <FitBounds markers={safeMarkers} />
      <MapRecenter center={center} />
      
      {safeMarkers.map((m) => (
        <Marker 
          key={m.id} 
          position={[m.lat, m.lng]} 
          icon={icons[m.kind]}
          ref={(el) => {
            if (el) {
              markerRefs.current[m.id] = el
            } else {
              delete markerRefs.current[m.id]
            }
          }}
          eventHandlers={{
            click: () => {
              if (onMarkerClick) onMarkerClick(m.id)
            }
          }}
        >
          <Popup className="custom-leaflet-popup">
            <div className="p-1 space-y-1.5 min-w-[180px]">
              <span className="block text-sm font-bold text-slate-900 leading-tight">{m.label}</span>
              {m.sublabel && (
                <span className="block text-[11px] font-medium text-slate-500 leading-normal">{m.sublabel}</span>
              )}
              
              {/* Universal Google Maps Direct Direction Intent URL */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 flex items-center justify-center gap-1.5 w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-xl transition-colors no-underline shadow-sm shadow-emerald-600/15"
              >
                <Navigation className="size-3" />
                Get Directions
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}