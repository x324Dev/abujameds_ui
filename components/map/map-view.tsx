// // 'use client'

// // import dynamic from 'next/dynamic'
// // import { Loader2 } from 'lucide-react'
// // import type { MapMarker } from './leaflet-map'

// // const LeafletMap = dynamic(() => import('./leaflet-map'), {
// //   ssr: false,
// //   loading: () => (
// //     <div className="flex h-full w-full items-center justify-center bg-muted">
// //       <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
// //     </div>
// //   ),
// // })

// // export type { MapMarker }

// // export function MapView({
// //   markers,
// //   center,
// //   className,
// // }: {
// //   markers: MapMarker[]
// //   center?: [number, number]
// //   className?: string
// // }) {
// //   return (
// //     <div className={className}>
// //       <LeafletMap markers={markers} center={center} />
// //     </div>
// //   )
// // }


// 'use client'

// import dynamic from 'next/dynamic'
// import { Loader2 } from 'lucide-react'
// import type { MapMarker } from './leaflet-map'

// const LeafletMap = dynamic(() => import('./leaflet-map'), {
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
import type { MapMarker } from './leaflet-map'

// Wrapped with <any> to eliminate strict dynamic property errors on the underlying map instance
const LeafletMap = dynamic<any>(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden="true" />
    </div>
  ),
})

export type { MapMarker }

interface MapViewProps {
  markers: MapMarker[]
  center?: [number, number]
  activeId?: string | null
  onMarkerClick?: (id: string) => void
  className?: string
}

export function MapView({
  markers,
  center,
  activeId,
  onMarkerClick,
  className,
}: MapViewProps) {
  
  // Calculate center coordinate maps dynamically if a card is actively focused/engaged
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