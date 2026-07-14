"use client"

import { Card } from "@/components/ui/card"
import { Building2, Activity, ShieldAlert } from "lucide-react"

export default function InstitutionalDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Institutional Compliance Console</h1>
        <p className="text-sm text-muted-foreground">Oversee authentication metrics and distribution safety tracking logs across the region.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 border-l-4 border-l-primary">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Monitored Facilities</span>
          </div>
          <h2 className="text-2xl font-bold mt-2">42 Active</h2>
        </Card>
        <Card className="p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-medium text-muted-foreground">Scans Processed (24h)</span>
          </div>
          <h2 className="text-2xl font-bold mt-2">1,892</h2>
        </Card>
        <Card className="p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium text-muted-foreground">Counterfeit Warnings</span>
          </div>
          <h2 className="text-2xl font-bold mt-2">0 Flagged</h2>
        </Card>
      </div>
    </div>
  )
}