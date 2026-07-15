// 'use client'

// import dynamic from 'next/dynamic'
// import { Loader2 } from 'lucide-react'
// import type { MapMarker } from './leaflet-map'

// // Wrapped with <any> to eliminate strict dynamic property errors on the underlying map instance
// const LeafletMap = dynamic<any>(() => import('./leaflet-map'), {
//   ssr: false,
//   loading: () => (
//     <div className="flex h-full w-full items-center justify-center bg-muted">
//       <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
//     </div>
//   ),
// })

// export type { MapMarker }

// interface MapViewProps {
//   markers: MapMarker[]
//   center?: [number, number]
//   activeId?: string | null
//   onMarkerClick?: (id: string) => void
//   className?: string
// }

// export function MapView({
//   markers,
//   center,
//   activeId,
//   onMarkerClick,
//   className,
// }: MapViewProps) {
  
//   // Calculate center coordinate maps dynamically if a card is actively focused/engaged
//   const calculatedCenter = (() => {
//     if (activeId) {
//       const targetMarker = markers.find((m) => m.id === activeId)
//       if (targetMarker) {
//         return [targetMarker.lat, targetMarker.lng] as [number, number]
//       }
//     }
//     return center
//   })()

//   return (
//     <div className={className}>
//       <LeafletMap 
//         markers={markers} 
//         center={calculatedCenter} 
//         activeId={activeId}
//         onMarkerClick={onMarkerClick}
//       />
//     </div>
//   )
// }


'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import type { MapMarker, MarkerKind } from './leaflet-map'

const LeafletMap = dynamic<any>(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-slate-50/50">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="size-6 animate-spin text-emerald-600" aria-hidden="true" />
        <span className="text-xs text-slate-400 font-bold tracking-wider uppercase">Loading Live Maps...</span>
      </div>
    </div>
  ),
})

// FIX: Export both MapMarker and MarkerKind safely
export type { MapMarker, MarkerKind }

interface MapViewProps {
  markers: MapMarker[]
  center?: [number, number]
  activeId?: string | null
  onMarkerClick?: (id: string | null) => void
  className?: string
}

export function MapView({
  markers,
  center,
  activeId,
  onMarkerClick,
  className,
}: MapViewProps) {
  
  const calculatedCenter = (() => {
    if (activeId) {
      const targetMarker = markers.find((m) => m.id === activeId)
      if (targetMarker) {
        return [targetMarker.lat, targetMarker.lng] as [number, number]
      }
    }
    return center
  })()

  return (
    <div className={className}>
      <LeafletMap 
        markers={markers} 
        center={calculatedCenter} 
        activeId={activeId}
        onMarkerClick={onMarkerClick}
      />
    </div>
  )
}