"use client"

import * as React from "react"
import { 
  History, 
  Database,
  AlertCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAuditLogs } from "@/lib/actions/accounting"

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getAuditLogs()
        setLogs(data)
      } catch (err) {
        console.error("Failed to load audit logs:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const columns = [
    { 
      accessorKey: "created_at", 
      header: "Waktu",
      cell: ({ row }: { row: any }) => (
        <span className="font-mono text-xs">
          {new Date(row.getValue("created_at")).toLocaleString('id-ID')}
        </span>
      )
    },
    { 
      accessorKey: "profiles", 
      header: "User",
      cell: ({ row }: { row: any }) => (
        <span>{row.original.profiles?.full_name || 'System'}</span>
      )
    },
    { 
      accessorKey: "action", 
      header: "Aksi",
      cell: ({ row }: { row: any }) => {
        const action = row.getValue("action") as string
        let variant: "default" | "secondary" | "destructive" | "outline" = "default"
        if (action.includes("create") || action.includes("insert")) variant = "default"
        if (action.includes("update")) variant = "secondary"
        if (action.includes("delete") || action.includes("reject")) variant = "destructive"
        if (action.includes("login") || action.includes("select")) variant = "outline"
        
        return <Badge variant={variant} className="font-mono text-[10px] uppercase">{action}</Badge>
      }
    },
    { accessorKey: "table_name", header: "Tabel" },
    { 
      accessorKey: "record_id", 
      header: "Record ID",
      cell: ({ row }: { row: any }) => (
        <span className="font-mono text-xs truncate max-w-[120px] block">
          {row.getValue("record_id")}
        </span>
      )
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">Transparansi aktivitas sistem dan riwayat perubahan data.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline">
              <Database className="mr-2 h-4 w-4" />
              Backup Logs
           </Button>
        </div>
      </div>

      <Card className="shadow-md">
         <CardHeader>
            <div className="flex items-center gap-2">
               <History className="h-5 w-5 text-primary" />
               <CardTitle>Log Aktivitas Sistem</CardTitle>
            </div>
            <CardDescription>Seluruh aksi kritikal yang dilakukan oleh pengguna terdaftar.</CardDescription>
         </CardHeader>
         <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <p className="text-muted-foreground animate-pulse">Memuat audit logs...</p>
              </div>
            ) : (
              <DataTable columns={columns} data={logs} searchKey="action" />
            )}
         </CardContent>
      </Card>
    </div>
  )
}
