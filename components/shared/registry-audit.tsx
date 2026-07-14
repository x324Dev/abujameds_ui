"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

interface AuditLog {
  id: string
  created_at: string
  barcode_code: string
  verdict: 'verified' | 'suspicious' | 'not_found'
  facility_name: string
}

const columns: ColumnDef<AuditLog>[] = [
  { 
    accessorKey: "created_at", 
    header: "Time",
    cell: ({ row }) => {
      const val = row.getValue("created_at") as string
      return <span>{val ? new Date(val).toLocaleTimeString() : '—'}</span>
    }
  },
  { 
    accessorKey: "barcode_code", 
    header: "Barcode Code" 
  },
  { 
    accessorKey: "verdict", 
    header: "Verdict",
    cell: ({ row }) => {
      const verdict = row.getValue("verdict") as string
      return <span className="font-medium capitalize">{verdict.replace('_', ' ')}</span>
    }
  },
  { 
    accessorKey: "facility_name", 
    header: "Facility" 
  },
]

export function RegistryAuditLog() {
  const { data, error, isLoading } = useSWR<AuditLog[]>("/api/v1/registry", fetcher, {
    revalidateOnFocus: false,
  })

  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Syncing ledger audit logs...</div>
  if (error) return <div className="p-4 text-sm text-destructive">Could not reach central verification registry server.</div>

  return <DataTable columns={columns} data={data || []} />
}