"use client"

import { Card } from "@/components/ui/card"
import { ShieldCheck, History, Calendar } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

export default function PatientAccountPage() {
  const { user } = useAuth()

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.display_name?.split(" ")[0]}</h1>
        <p className="text-sm text-muted-foreground">Monitor your verified pharmacy lookups and safe allocations.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5 flex items-center gap-4">
          <span className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl"><ShieldCheck className="h-6 w-6" /></span>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Verified Safe Medicines</p>
            <h3 className="text-2xl font-bold">14 Packs</h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <span className="p-3 bg-primary/10 text-primary rounded-xl"><History className="h-6 w-6" /></span>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Recent Registry Lookups</p>
            <h3 className="text-2xl font-bold">2 Active</h3>
          </div>
        </Card>
      </div>
    </div>
  )
}