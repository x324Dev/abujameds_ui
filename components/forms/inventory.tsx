'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { apiMutate } from '@/lib/fetcher'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface AddInventoryFormProps {
  onSuccess: () => void
}

export function AddInventoryForm({ onSuccess }: AddInventoryFormProps) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      drug_name: '',
      sku: '',
      quantity: 0,
      stock_status: 'optimal'
    }
  })

  async function onSubmit(data: any) {
    setLoading(true)
    try {
      // Force quantity format conversion safely
      const payload = {
        ...data,
        quantity: parseInt(data.quantity, 10) || 0
      }

      await apiMutate('/api/v1/inventory', 'POST', payload)
      toast.success('Inventory record added successfully')
      reset()
      onSuccess()
    } catch (err) {
      toast.error('Failed to register stock line metadata.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 text-left">
      <div className="space-y-1.5">
        <Label htmlFor="drug_name">Medication Name</Label>
        <Input id="drug_name" placeholder="e.g., Amoxicillin 500mg" {...register('drug_name', { required: true })} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sku">Stock Keeping Unit (SKU / Barcode)</Label>
        <Input id="sku" placeholder="e.g., AMX-500-NG" {...register('sku', { required: true })} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="quantity">Initial Quantity</Label>
          <Input id="quantity" type="number" {...register('quantity', { required: true, min: 0 })} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="stock_status">Inventory Status</Label>
          <select 
            id="stock_status"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('stock_status')}
          >
            <option value="optimal">Optimal</option>
            <option value="low">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      <Button type="submit" className="w-full mt-2" disabled={loading}>
        {loading && <Loader2 className="size-4 animate-spin mr-2" />}
        Provision Stock Entry
      </Button>
    </form>
  )
}