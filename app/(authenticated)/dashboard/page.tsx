'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InventoryTable } from "@/components/shared/inventory-table"
import { RegistryAuditLog } from "@/components/shared/registry-audit"
import { usePharmacyDashboard, useCurrentUser } from "@/hooks/api"
import type { UserRole } from '@/lib/api/types'
import { 
  Package, 
  AlertTriangle, 
  History, 
  Layers, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  Plus, 
  UploadCloud 
} from 'lucide-react'

export default function PharmacyDashboardPage() {
  const { data: userContext, isLoading: authLoading } = useCurrentUser()
  const { data: metrics, isLoading: metricsLoading } = usePharmacyDashboard()
  const [activeTab, setActiveTab] = useState<'inventory' | 'audits'>('inventory')

  // 1. Authentication State Gate
  if (authLoading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground animate-pulse">
        Verifying secure workspace session...
      </div>
    )
  }

  const userRole = (userContext?.role || userContext?.user?.role || 'patient') as UserRole

  // 2. Absolute Intrusion Block: Patients have no business here
  if (userRole === 'patient') {
    return (
      <div className="max-w-md mx-auto my-12 p-6 border border-destructive/20 rounded-xl bg-destructive/5 text-center space-y-4">
        <ShieldAlert className="size-8 text-destructive mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Unauthorized Workspace Access</h2>
        <p className="text-sm text-muted-foreground">
          Your client account type does not have standard clearing permissions for this terminal. Please return to the dispensary store view.
        </p>
      </div>
    )
  }

  // 3. Dynamic Privilege Resolution
  const isSuperAdmin = userRole === 'superadmin'
  const isPharmacyAdmin = userRole === 'pharmacy_admin'
  const isInstitutional = userRole === 'institutional'

  const canMutateInventory = isPharmacyAdmin || isSuperAdmin
  const canViewAudits = isPharmacyAdmin || isInstitutional || isSuperAdmin
  const canViewInventory = isPharmacyAdmin || isSuperAdmin

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-left space-y-8 animate-in fade-in duration-300">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground uppercase tracking-wide">
            {userRole.replace('_', ' ')} Console
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isInstitutional 
              ? "High-level demand analysis and ledger verification stream." 
              : "Localized stock matrix modification, alerts tracker, and order validation."
            }
          </p>
        </div>
        
        {/* Context-Aware Mutation Actions */}
        {canMutateInventory && (
          <div className="flex items-center gap-2 shrink-0">
            {isSuperAdmin && (
              <Button variant="outline" size="sm" className="h-9 gap-1.5 shadow-sm border-border">
                <UploadCloud className="size-4 text-muted-foreground" /> Ingest Core Manifest
              </Button>
            )}
            <Button size="sm" className="h-9 gap-1.5 shadow-sm font-medium">
              <Plus className="size-4" /> Add Stock Line
            </Button>
          </div>
        )}
      </div>

      {/* Dynamic KPI Metric Rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {canViewInventory && (
          <>
            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tracked SKUs</p>
                  <p className="text-2xl font-black">{metricsLoading ? '...' : metrics?.out_of_stock_count ?? 0}</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10 text-primary"><Package className="size-5" /></div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Critical Shortages</p>
                  <p className="text-2xl font-black text-amber-500">{metricsLoading ? '...' : metrics?.low_stock_count ?? 0}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500"><AlertTriangle className="size-5" /></div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly Orders</p>
                  <p className="text-2xl font-black text-emerald-500">{metricsLoading ? '...' : metrics?.out_of_stock_count ?? 0}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><TrendingUp className="size-5" /></div>
              </CardContent>
            </Card>
          </>
        )}

        {canViewAudits && (
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ledger Status</p>
                <p className="text-2xl font-black text-sky-500">Live Verification</p>
              </div>
              <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500"><Activity className="size-5" /></div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Data Presentation Surface */}
      <div className="space-y-4">
        {/* Only render navigation selectors if user is cleared for both views */}
        {canViewInventory && canViewAudits ? (
          <div className="flex border-b border-border p-1 bg-muted/40 rounded-xl max-w-sm">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center justify-center gap-2 flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'inventory' ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground'
              }`}
            >
              <Layers className="size-3.5" /> Stock Matrix
            </button>
            <button
              onClick={() => setActiveTab('audits')}
              className={`flex items-center justify-center gap-2 flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'audits' ? 'bg-card text-foreground shadow-sm border border-border' : 'text-muted-foreground'
              }`}
            >
              <History className="size-3.5" /> Audit Log Tracker
            </button>
          </div>
        ) : null}

        <div className="pt-2">
          {/* Explicitly isolate views based on privilege checks */}
          {isInstitutional && (
            <Card className="border-border bg-card shadow-sm overflow-hidden">
              <RegistryAuditLog />
            </Card>
          )}

          {!isInstitutional && canViewInventory && (
            <Card className="border-border bg-card shadow-sm overflow-hidden">
              {activeTab === 'inventory' ? <InventoryTable /> : <RegistryAuditLog />}
            </Card>
          )}
        </div>
      </div>

    </div>
  )
}