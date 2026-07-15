"use client"

import { useState } from "react"
import { HospitalClient } from "@/components/patient/hospital-client"
import { SpecializationSelector } from "@/components/facilities/specialization-selector"

export default function FacilitiesPage() {
  // State tracking the selected medical specialization across Abuja facilities
  const [specialization, setSpecialization] = useState<string>("")

  return (
    // Moved top padding here to account for the fixed header height cleanly
    <div className="flex min-h-dvh flex-col bg-background pt-24 md:pt-28 lg:pt-32">
      
      <main className="flex-1 pb-12">
        {/* Specialization Control Area */}
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Filter by Medical Specialization
            </span>
            <SpecializationSelector 
              selected={specialization} 
              onSelect={setSpecialization} 
            />
          </div>
        </div>

        {/* Core Interactive Facility Portal 
          Passing specialization down lets the client-side component switch its internal 
          SWR fetcher smoothly to /api/v1/facilities/hospitals/by-specialisation 
        */}
        <HospitalClient specialization={specialization} />
      </main>
    </div>
  )
}