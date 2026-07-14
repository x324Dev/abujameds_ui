"use client"

import { useState } from "react"
import { HospitalClient } from "@/components/patient/hospital-client"
import { SpecializationSelector } from "@/components/facilities/specialization-selector"

export default function FacilitiesPage() {
  // State tracking the selected medical specialization across Abuja facilities
  const [specialization, setSpecialization] = useState<string>("")

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      
      <main className="flex-1 pb-12">
        {/* Specialization Control Area */}
        <div className="mx-auto w-full max-w-6xl px-4 pt-6">
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
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