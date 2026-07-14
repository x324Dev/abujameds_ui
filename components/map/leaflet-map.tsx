// 'use client'

// import 'leaflet/dist/leaflet.css'
// import L from 'leaflet'
// import { useEffect, useMemo } from 'react'
// import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'

// export type MarkerKind = 'pharmacy' | 'hospital' | 'partner' | 'emergency'

// export interface MapMarker {
//   id: string
//   lat: number
//   lng: number
//   kind: MarkerKind
//   label: string
//   sublabel?: string
// }

// const COLORS: Record<MarkerKind, string> = {
//   pharmacy: '#0A6E4F',
//   hospital: '#006B6B',
//   partner: '#C4871A',
//   emergency: '#DC2626',
// }

// function markerHtml(kind: MarkerKind) {
//   const color = COLORS[kind]
//   const pulse =
//     kind === 'emergency'
//       ? `<span style="position:absolute;inset:-6px;border-radius:9999px;background:${color};opacity:0.3;animation:emergency-pulse 2s infinite;"></span>`
//       : ''

//   if (kind === 'hospital' || kind === 'emergency') {
//     // Cross-shaped medical marker
//     return `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:26px;height:26px;">${pulse}
//       <span style="position:relative;display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:6px;background:${color};box-shadow:0 1px 4px rgba(0,0,0,0.3);">
//         <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
//       </span></div>`
//   }
//   if (kind === 'partner') {
//     // Square partner marker
//     return `<div style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:4px;background:${color};box-shadow:0 1px 4px rgba(0,0,0,0.3);border:2px solid white;"></div>`
//   }
//   // Circular pharmacy marker
//   return `<div style="display:flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:9999px;background:${color};box-shadow:0 1px 4px rgba(0,0,0,0.3);border:2px solid white;"></div>`
// }

// function icon(kind: MarkerKind) {
//   return L.divIcon({
//     html: markerHtml(kind),
//     className: 'am-marker',
//     iconSize: [26, 26],
//     iconAnchor: [13, 13],
//   })
// }

// function FitBounds({ markers }: { markers: MapMarker[] }) {
//   const map = useMap()
//   useEffect(() => {
//     if (markers.length === 0) return
//     if (markers.length === 1) {
//       map.setView([markers[0].lat, markers[0].lng], 14)
//       return
//     }
//     const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]))
//     map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
//   }, [markers, map])
//   return null
// }

// export default function LeafletMap({
//   markers,
//   center = [9.0765, 7.4854],
//   className,
// }: {
//   markers: MapMarker[]
//   center?: [number, number]
//   className?: string
// }) {
//   const icons = useMemo(
//     () => ({
//       pharmacy: icon('pharmacy'),
//       hospital: icon('hospital'),
//       partner: icon('partner'),
//       emergency: icon('emergency'),
//     }),
//     [],
//   )

//   return (
//     <MapContainer
//       center={center}
//       zoom={12}
//       zoomControl={false}
//       scrollWheelZoom
//       className={className}
//       style={{ height: '100%', width: '100%' }}
//     >
//       <TileLayer
//         attribution='&copy; OpenStreetMap'
//         url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
//       />
//       <FitBounds markers={markers} />
//       {markers.map((m) => (
//         <Marker key={m.id} position={[m.lat, m.lng]} icon={icons[m.kind]}>
//           <Popup>
//             <span className="block text-sm font-semibold text-foreground">{m.label}</span>
//             {m.sublabel && (
//               <span className="block text-xs text-muted-foreground">{m.sublabel}</span>
//             )}
//           </Popup>
//         </Marker>
//       ))}
//     </MapContainer>
//   )
// }


'use client'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'

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
  pharmacy: '#0A6E4F',
  hospital: '#006B6B',
  partner: '#C4871A',
  emergency: '#DC2626',
}

function MapRecenter({ center }: { center?: [number, number] }) {
  const map = useMap()
  
  useEffect(() => {
    if (!center || typeof center[0] !== 'number' || typeof center[1] !== 'number' || isNaN(center[0]) || isNaN(center[1])) {
      return
    }

    try {
      const currentCenter = map.getCenter()
      
      // CRITICAL FIX: If the map's internal tracking state is corrupted (NaN), 
      // flyTo animation math breaks. Force-reset the plane with setView instead.
      if (!currentCenter || isNaN(currentCenter.lat) || isNaN(currentCenter.lng)) {
        map.setView(center, 15)
      } else {
        map.flyTo(center, 15, {
          animate: true,
          duration: 1.2,
        })
      }
    } catch (error) {
      // Fallback rescue layer to catch any deep Leaflet engine execution panics
      console.error("Leaflet cinematic pan failed, falling back to instant setView:", error)
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
    return `<div style="position:relative;display:flex;align-items:center;justify-content:center;width:26px;height:26px;">${pulse}
      <span style="position:relative;display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:6px;background:${color};box-shadow:0 1px 4px rgba(0,0,0,0.3);">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </span></div>`
  }
  if (kind === 'partner') {
    return `<div style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:4px;background:${color};box-shadow:0 1px 4px rgba(0,0,0,0.3);border:2px solid white;"></div>`
  }
  return `<div style="display:flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:9999px;background:${color};box-shadow:0 1px 4px rgba(0,0,0,0.3);border:2px solid white;"></div>`
}

function icon(kind: MarkerKind) {
  return L.divIcon({
    html: markerHtml(kind),
    className: 'am-marker',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  })
}

function FitBounds({ markers }: { markers: MapMarker[] }) {
  const map = useMap()
  
  useEffect(() => {
    // Sanitize bounding calculations to block trace corruption from malformed entries
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
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
    } catch (e) {
      console.error("Could not complete automatic fitBounds calculation:", e)
    }
  }, [markers, map])
  
  return null
}

export default function LeafletMap({
  markers,
  center,
  className,
}: {
  markers: MapMarker[]
  center?: [number, number]
  className?: string
}) {
  const icons = useMemo(
    () => ({
      pharmacy: icon('pharmacy'),
      hospital: icon('hospital'),
      partner: icon('partner'),
      emergency: icon('emergency'),
    }),
    [],
  )

  // Enforce fallback default location coordinates if the prop values are missing/corrupted
  const safeInitialCenter = useMemo<[number, number]>(() => {
    if (center && typeof center[0] === 'number' && typeof center[1] === 'number' && !isNaN(center[0]) && !isNaN(center[1])) {
      return center
    }
    return [9.0765, 7.4854] // Abuja Default
  }, [center])

  // Clean the JSX render array to prevent empty/broken elements from crashing DOM bindings
  const safeMarkers = useMemo(() => {
    return (markers || []).filter(
      (m) => m && typeof m.lat === 'number' && typeof m.lng === 'number' && !isNaN(m.lat) && !isNaN(m.lng)
    )
  }, [markers])

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
        <Marker key={m.id} position={[m.lat, m.lng]} icon={icons[m.kind]}>
          <Popup>
            <span className="block text-sm font-semibold text-foreground">{m.label}</span>
            {m.sublabel && (
              <span className="block text-xs text-muted-foreground">{m.sublabel}</span>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}