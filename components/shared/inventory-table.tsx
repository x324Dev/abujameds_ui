// components/shared/inventory-table.tsx
"use client"

import { usePharmacyInventory } from "@/hooks/api"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import type { InventoryItem } from "@/lib/api/types"

const columns: ColumnDef<InventoryItem>[] = [
  { 
    accessorKey: "drug_name", 
    header: "Product Name" 
  },
  { 
    accessorKey: "sku", 
    header: "SKU" 
  },
  { 
    accessorKey: "quantity", 
    header: "Stock Level" 
  },
  { 
    accessorKey: "stock_status", 
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("stock_status") as string
      return (
        <span className={`capitalize font-medium ${
          status === 'out_of_stock' ? 'text-destructive' : status === 'low' ? 'text-amber-500' : 'text-emerald-500'
        }`}>
          {status ? status.replace('_', ' ') : 'Unknown'}
        </span>
      )
    }
  },
]

export function InventoryTable() {
  // Using the exact hook from your api.ts file
  const { data, error, isLoading } = usePharmacyInventory()

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Loading verified inventory allocations...</div>
  if (error) return <div className="p-4 text-sm text-destructive">Failed to load inventory data. Verify secure cookie handshakes.</div>

  return <DataTable columns={columns} data={data || []} />
}