'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Upload, RefreshCw } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AddInventoryForm } from '@/components/forms/inventory'
import { BulkUploadForm } from '@/components/forms/inventory-bulk'
import { useSWRConfig } from 'swr'

export default function InventoryManagementPage() {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const { mutate } = useSWRConfig()

  const refreshInventoryData = () => {
    mutate('/api/v1/inventory')
  }

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Stock Telemetry Control</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage live retail medication items and synchronize batch tracking records.
          </p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={refreshInventoryData} className="border-border">
            <RefreshCw className="size-3.5 mr-1.5" /> Sync Views
          </Button>

          {/* Bulk Ingest Trigger — Swapped asChild for Base UI render prop pattern */}
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger render={
              <Button variant="outline" size="sm" className="border-border gap-1.5">
                <Upload className="size-3.5" /> Bulk CSV Ingest
              </Button>
            } />
            <DialogContent className="sm:max-w-md border-border bg-card">
              <DialogHeader className="text-left">
                <DialogTitle className="text-lg font-bold">Bulk Stock Upload</DialogTitle>
              </DialogHeader>
              <BulkUploadForm onSuccess={() => { setIsUploadOpen(false); refreshInventoryData(); }} />
            </DialogContent>
          </Dialog>

          {/* Single Item Trigger — Swapped asChild for Base UI render prop pattern */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger render={
              <Button size="sm" className="gap-1.5 shadow-sm">
                <Plus className="size-3.5" /> Add Stock Line
              </Button>
            } />
            <DialogContent className="sm:max-w-md border-border bg-card">
              <DialogHeader className="text-left">
                <DialogTitle className="text-lg font-bold">Create Stock Entry</DialogTitle>
              </DialogHeader>
              <AddInventoryForm onSuccess={() => { setIsAddOpen(false); refreshInventoryData(); }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}