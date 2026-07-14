import { CommandCenter } from '@/components/patient/search-center'
import { SiteHeader } from '@/components/patient/site-header'
import { TrustIndicators, HowItWorks, MapPreview } from '@/components/patient/landing-sections'

// export default function HomePage() {
//   return (
//     <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50/50 via-white to-white">
//       <SiteHeader />
      
//       <main className="relative">
//         {/* Modern Hero Section */}
//         <section className="relative pt-20 pb-24 px-4 sm:pt-32">
//           <div className="mx-auto max-w-4xl text-center">
//             <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
//               Your Health, <br className="hidden sm:block" />
//               <span className="text-emerald-600">Available Instantly.</span>
//             </h1>
//             <p className="mx-auto max-w-2xl text-lg text-slate-600 mb-10 leading-relaxed">
//               Find pharmacies in Abuja with real-time stock levels. Verify your medication authenticity directly with NAFDAC registries.
//             </p>
            
//             {/* The Floating Command Center */}
//             <CommandCenter />
//           </div>
//         </section>

//         {/* Sections */}
//         <div className="space-y-20 pb-20">
//           <TrustIndicators />
//           <HowItWorks />
//           <MapPreview />
//         </div>
//       </main>
//     </div>
//   )
// }

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden">
      {/* Dynamic Background "Pulse" */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-5%] size-[600px] bg-emerald-200/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-5%] size-[500px] bg-sky-200/30 rounded-full blur-[120px]" />
      </div>

      <SiteHeader />

      <main className="relative z-10 flex flex-col items-center justify-center pt-20 px-4">
        {/* The "Living" Status Bar */}
        <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 bg-white/50 backdrop-blur-md rounded-full border border-slate-200/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
           <span className="relative flex size-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
           </span>
           <span className="text-xs font-medium text-slate-600">342 Pharmacies active in FCT</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-950 text-center mb-12">
           Your Health, <br/> 
           <span className="text-emerald-600">Always Within Reach</span>
        </h1>

        {/* Floating Command Center */}
        <div className="w-full max-w-xl group">
          <CommandCenter />
        </div>
      </main>
    </div>
  )
}