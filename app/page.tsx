"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/patient/site-header"
import { CommandCenter } from "@/components/patient/search-center"
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  MapPin, 
  Activity, 
  CheckCircle2, 
  Store, 
  RefreshCw, 
  UserCheck, 
  ArrowRight,
  Plus
} from "lucide-react"

// Curated high-quality visuals contextualizing local medicine verification & search
const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80",
    title: "Verified FCT Inventory",
    description: "Direct connection with verified pharmaceutical distributors across Abuja."
  },
  {
    image: "https://images.unsplash.com/photo-1631549916768-4119b2e55c26?auto=format&fit=crop&w=800&q=80",
    title: "Instant NAFDAC Check",
    description: "Guard against counterfeit medication using our automated verification database."
  },
  {
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    title: "Locate Lifesaving Care",
    description: "Find real-time drug availability and route instantly to nearby hospital pharmacies."
  }
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-rotate the showcase slide every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative min-h-screen bg-slate-50/50 overflow-x-hidden">
      {/* Structural Mesh & Gradient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a05_1px,transparent_1px),linear-gradient(to_bottom,#0f172a05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-[-10%] right-[-5%] size-[300px] md:size-[600px] bg-emerald-200/20 rounded-full blur-[80px] md:blur-[130px]" />
        <div className="absolute bottom-[10%] left-[-5%] size-[250px] md:size-[500px] bg-indigo-200/20 rounded-full blur-[80px] md:blur-[130px]" />
      </div>

      <SiteHeader />

      {/* --- HERO SECTION --- */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 lg:pt-40 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Value Proposition & CommandCenter */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start space-y-6 text-center lg:text-left">
            
            {/* Live Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full shadow-sm">
              <span className="relative flex size-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] md:text-xs font-bold text-emerald-800 tracking-wide uppercase">
                342 active pharmacies in FCT
              </span>
            </div>

            {/* Typography */}
            <div className="space-y-3 md:space-y-4">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.15] lg:leading-[1.1]">
                Your Health, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                  Always Within Reach
                </span>
              </h1>
              <p className="max-w-md md:max-w-lg text-sm md:text-base lg:text-lg text-slate-500 font-medium leading-relaxed">
                Search verified local inventory, check critical NAFDAC compliance, and secure authentic medication across Abuja in seconds.
              </p>
            </div>

            {/* CommandCenter Component (Handles its own mobile layout beautifully) */}
            <div className="w-full pt-2">
              <CommandCenter />
            </div>

            {/* Trust Anchors - Mobile Friendly Flex/Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 w-full max-w-lg border-t border-slate-200/60 text-left">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shrink-0">
                  <CheckCircle2 className="size-4" />
                </div>
                <span className="text-xs font-bold text-slate-700">Secure Sourcing</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 shrink-0">
                  <Shield className="size-4" />
                </div>
                <span className="text-xs font-bold text-slate-700">NAFDAC Audited</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-full bg-teal-50 text-teal-600 shrink-0">
                  <MapPin className="size-4" />
                </div>
                <span className="text-xs font-bold text-slate-700">FCT Coverage</span>
              </div>
            </div>

          </div>

          {/* Right Column: Dynamic Visual Showcase (Hidden on Mobile, Beautifully Configured on Desktop) */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto rounded-[2.5rem] border-4 border-white bg-slate-100 shadow-[0_24px_70px_rgba(0,0,0,0.1)] overflow-hidden group">
              
              {/* Dynamic Images */}
              {SLIDES.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 opacity-80" />
                  
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="h-full w-full object-cover scale-105 group-hover:scale-100 transition-transform duration-[5000ms] ease-out"
                  />

                  {/* Dynamic Slide Content Card */}
                  <div className="absolute bottom-8 left-8 right-8 z-20 text-white space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[10px] font-bold tracking-wider uppercase">
                      <Activity className="size-3 text-emerald-400" />
                      <span>Live Platform Insight</span>
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">{slide.title}</h3>
                    <p className="text-xs text-slate-200/90 leading-relaxed font-medium">
                      {slide.description}
                    </p>
                  </div>
                </div>
              ))}

              {/* Slider Dots */}
              <div className="absolute top-6 right-6 z-30 flex gap-1.5">
                {SLIDES.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`size-2 rounded-full transition-all cursor-pointer ${
                      index === currentSlide ? "bg-white w-6" : "bg-white/40"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  )
}