import { HospitalClient } from "@/components/patient/hospital-client"

export const metadata = {
  title: "Find a Hospital — AbujaMeds",
  description: "Locate certified healthcare facilities and 24/7 emergency care across Abuja.",
}

export default function HospitalsPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-muted/30">
      <main className="flex-1">
        <HospitalClient />
      </main>
    </div>
  )
}