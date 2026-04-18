"use client"

import * as React from "react"
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowLeftRight,
  TrendingUp,
  Download,
  Calendar
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatIDR, formatIDRCompact } from "@/lib/utils"
import { StatCard } from "@/components/stat-card"
import { DataTable } from "@/components/data-table"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getCashBookEntries } from "@/lib/actions/accounting"

export default function CashBookPage() {
  const [entries, setEntries] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getCashBookEntries()
        setEntries(data)
      } catch (err) {
        console.error("Failed to load cash book:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])



  // Calculate stats from real data
  const totalIn = entries.filter(e => e.type === 'in').reduce((acc, e) => acc + Number(e.amount), 0)
  const totalOut = entries.filter(e => e.type === 'out').reduce((acc, e) => acc + Number(e.amount), 0)
  const balance = totalIn - totalOut

  const categoryLabel: Record<string, string> = {
    savings_deposit: "Setoran Simpanan",
    savings_withdrawal: "Penarikan Simpanan",
    loan_disbursement: "Pencairan Pinjaman",
    loan_installment: "Angsuran Pinjaman",
    other: "Lainnya",
  }

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
      accessorKey: "category", 
      header: "Kategori",
      cell: ({ row }: { row: any }) => (
        <span>{categoryLabel[row.getValue("category")] || row.getValue("category")}</span>
      )
    },
    { accessorKey: "description", header: "Keterangan" },
    { 
      accessorKey: "type", 
      header: "Aliran",
      cell: ({ row }: { row: any }) => {
        const type = row.getValue("type")
        return (
          <Badge 
            variant={type === "in" ? "default" : "destructive"} 
            className={type === "in" 
              ? "gap-1 bg-emerald-500/15 text-emerald-700 border-emerald-500/20" 
              : "gap-1"
            }
          >
            {type === "in" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {type === "in" ? "Masuk" : "Keluar"}
          </Badge>
        )
      }
    },
    { 
      accessorKey: "amount", 
      header: "Nominal",
      cell: ({ row }: { row: any }) => (
        <span className={row.original.type === "out" ? "text-red-600 font-bold" : "text-emerald-600 font-bold"}>
          {row.original.type === "out" ? "-" : "+"}{formatIDR(Number(row.getValue("amount")))}
        </span>
      )
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buku Kas (Ledger)</h1>
          <p className="text-muted-foreground">Catatan harian seluruh arus kas masuk dan keluar koperasi.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline">
             <Calendar className="mr-2 h-4 w-4" />
             Pilih Periode
           </Button>
           <Button>
             <Download className="mr-2 h-4 w-4" />
             Ekspor Jurnal
           </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Saldo Kas Saat Ini"
          value={formatIDRCompact(balance)}
          description="Total dana tersedia"
          icon={ArrowLeftRight}
          className="bg-indigo-500/5 border-indigo-500/20 shadow-none text-indigo-700"
        />
        <StatCard
          title="Total Pemasukan"
          value={formatIDRCompact(totalIn)}
          description="Total inflow dari segala sumber"
          icon={ArrowUpRight}
          className="bg-emerald-500/5 border-emerald-500/20 shadow-none text-emerald-700"
        />
        <StatCard
          title="Total Pengeluaran"
          value={formatIDRCompact(totalOut)}
          description="Total outflow operasional/pinjaman"
          icon={ArrowDownRight}
          className="bg-red-500/5 border-red-500/20 shadow-none text-red-700"
        />
      </div>

      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Jurnal Transaksi</CardTitle>
            <CardDescription>Detail rincian aliran kas secara kronologis.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Semua Aliran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Aliran</SelectItem>
                <SelectItem value="in">Kas Masuk</SelectItem>
                <SelectItem value="out">Kas Keluar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-muted-foreground animate-pulse">Memuat data kas...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={entries} searchKey="description" searchPlaceholder="Cari Keterangan Kas..." />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
