'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { FileSpreadsheet, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface BulkUploadFormProps {
  onSuccess: () => void
}

export function BulkUploadForm({ onSuccess }: BulkUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFileSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      // Direct raw fetch context implementation to bypass standard JSON headers
      const response = await fetch('/api/v1/inventory/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Ingest parse pipeline error')

      toast.success('Bulk ledger adjustments successfully integrated!')
      setFile(null)
      onSuccess()
    } catch (err) {
      toast.error('Processing error. Ensure formatting keys match drug_name, sku, quantity.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleFileSubmit} className="space-y-4 pt-2 text-left">
      <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/10 flex flex-col items-center justify-center gap-2">
        <FileSpreadsheet className="size-8 text-primary/70 animate-pulse" />
        <div className="space-y-1">
          <Label htmlFor="csv-file" className="cursor-pointer font-medium text-sm text-primary hover:underline">
            Click to choose tracking spreadsheet
          </Label>
          <p className="text-xs text-muted-foreground">Accepts structured standard .csv records</p>
        </div>
        <Input 
          id="csv-file" 
          type="file" 
          accept=".csv" 
          className="hidden" 
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      {file && (
        <div className="flex items-center gap-2 text-xs text-foreground/80 bg-muted/50 p-2.5 rounded-lg border border-border">
          <AlertCircle className="size-3.5 text-amber-500 shrink-0" />
          <span className="truncate font-mono">Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={uploading || !file}>
        {uploading && <Loader2 className="size-4 animate-spin mr-2" />}
        Process Ingest Integration
      </Button>
    </form>
  )
}