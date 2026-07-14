import Image from 'next/image'
import Link from 'next/link'
import {
  Clock,
  MapPin,
  PackageSearch,
  Search as SearchIcon,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react'

const TRUST = [
  {
    icon: ShieldCheck,
    title: 'NAFDAC Registry Verdicts',
    body: 'Real-time verification cross-referencing official NAFDAC numbers and barcode registries.',
  },
  {
    icon: Stethoscope,
    title: 'PCN Licensed Facilities',
    body: 'Inventory sourced exclusively from premises authenticated by the Pharmacists Council of Nigeria.',
  },
  {
    icon: Clock,
    title: 'Real-time Stock Tracking',
    body: 'Live availability updates from verified retail and emergency distribution hubs across the FCT.',
  },
]

const STEPS = [
  {
    icon: SearchIcon,
    title: '1. Locate or Scan',
    body: 'Search by drug name or immediately authenticate using the manufacturer scratch-off code.',
  },
  {
    icon: MapPin,
    title: '2. Map Nearby Stock',
    body: 'Filter facilities by real-time inventory levels, pricing, distance, and 24/7 emergency status.',
  },
  {
    icon: PackageSearch,
    title: '3. Verify & Secure',
    body: 'Confirm the product registration verdict and find the direct medical desk contact information.',
  },
]

// export function TrustIndicators() {
//   return (
//     <section className="border-y border-border bg-card">
//       <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:grid-cols-3">
//         {TRUST.map((t) => (
//           <div key={t.title} className="flex flex-col items-center gap-2 text-center">
//             <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-primary">
//               <t.icon className="size-5" aria-hidden="true" />
//             </span>
//             <h3 className="text-base font-semibold text-foreground">{t.title}</h3>
//             <p className="text-sm text-muted-foreground text-pretty">{t.body}</p>
//           </div>
//         ))}
//       </div>
//     </section>
//   )
// }
export function TrustIndicators() {
  return (
    <section className="py-20 bg-emerald-50/30">
      <div className="mx-auto grid max-w-5xl gap-6 px-4 sm:grid-cols-3">
        {TRUST.map((t) => (
          <div 
            key={t.title} 
            className="group relative flex flex-col items-center gap-4 p-8 rounded-3xl bg-white border border-emerald-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
              <t.icon className="size-7" />
            </span>
            <h3 className="text-lg font-bold text-slate-900">{t.title}</h3>
            <p className="text-sm text-slate-600 leading-relaxed text-center">{t.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// export function HowItWorks() {
//   return (
//     <section className="mx-auto max-w-5xl px-4 py-14">
//       <h2 className="text-center text-xl font-bold tracking-tight text-foreground sm:text-2xl">
//         How it works
//       </h2>
//       <div className="mt-8 grid gap-6 sm:grid-cols-3">
//         {STEPS.map((s) => (
//           <div
//             key={s.title}
//             className="relative rounded-xl border border-border bg-card p-6 shadow-sm transition-transform hover:-translate-y-0.5"
//           >
//             <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
//               <s.icon className="size-5" aria-hidden="true" />
//             </span>
//             <h3 className="mt-4 text-base font-semibold text-foreground">{s.title}</h3>
//             <p className="mt-1 text-sm text-muted-foreground text-pretty">{s.body}</p>
//           </div>
//         ))}
//       </div>
//     </section>
//   )
// }

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20">
      <h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900 mb-12">
        Simple, Secure Flow
      </h2>
      <div className="grid gap-8 sm:grid-cols-3">
        {STEPS.map((s, index) => (
          <div key={s.title} className="relative flex flex-col items-center text-center">
            {/* Connector line on desktop */}
            {index < 2 && (
              <div className="hidden sm:block absolute top-10 left-1/2 w-full h-px bg-emerald-100 -z-10" />
            )}
            
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-200 mb-6">
              <s.icon className="size-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// export function MapPreview() {
//   return (
//     <section className="mx-auto max-w-5xl px-4 pb-14">
//       <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
//         <div className="relative aspect-[16/9] w-full">
//           <Image
//             src="/abuja-map-preview.png"
//             alt="Dynamic map UI displaying live pharmaceutical stocks and verified healthcare facilities across Abuja"
//             fill
//             className="object-cover"
//             sizes="(max-width: 1024px) 100vw, 1024px"
//             priority
//           />
//           <div className="absolute inset-0 flex items-end bg-gradient-to-t from-foreground/50 via-foreground/10 to-transparent p-6">
//             <div className="text-primary-foreground">
//               <p className="text-xs font-semibold uppercase tracking-wider opacity-90">
//                 FCT Infrastructure Coverage
//               </p>
//               <p className="text-lg font-bold tracking-tight sm:text-xl">
//                 Real-time mapping of registered pharmaceutical channels
//               </p>
//             </div>
//           </div>
//         </div>
//         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-card">
//           <p className="text-sm text-muted-foreground">
//             From central municipal zones like Wuse and Maitama out to satellite hubs, track down verified medical supplies instantly.
//           </p>
//           <Link
//             href="/facilities"
//             className="shrink-0 text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
//           >
//             Explore the directory &rarr;
//           </Link>
//         </div>
//       </div>
//     </section>
//   )
// }

export function MapPreview() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-20">
      <div className="group relative overflow-hidden rounded-[2rem] border border-slate-200 shadow-2xl">
        <div className="relative aspect-[16/7] w-full">
          <Image
            src="/abuja-map-preview.png"
            alt="Abuja Pharmacy Map"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Subtle gradient gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
          
          <div className="absolute bottom-0 left-0 p-8 text-white">
            <span className="inline-block px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest mb-3 border border-white/10">
              Live Network
            </span>
            <h3 className="text-2xl font-bold">Real-time FCT coverage</h3>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-8 bg-white">
          <p className="text-slate-600 max-w-md">
            Track down verified medical supplies from Wuse to Maitama instantly.
          </p>
          <Link
            href="/facilities"
            className="group flex items-center gap-2 font-bold text-emerald-600 hover:text-emerald-700"
          >
            Explore Map <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}