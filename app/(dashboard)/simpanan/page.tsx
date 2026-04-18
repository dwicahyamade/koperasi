"use client"

import * as React from "react"
import Link from "next/link"
import { 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  History,
  TrendingUp,
  Download,
  Calendar as CalendarIcon,
  FilterX
} from "lucide-react"

import { format, startOfMonth, endOfMonth } from "date-fns"
import { DateRange } from "react-day-picker"
import { DatePickerWithRange } from "@/components/date-range-picker"

import { Button } from "@/components/ui/button"
import { formatIDR } from "@/lib/utils"
import { StatCard } from "@/components/stat-card"
import { DataTable } from "@/components/data-table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { getSavingsReport } from "@/lib/actions/savings"

export default function SavingsPage() {
  const [transactions, setTransactions] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  })

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const from = date?.from ? format(date.from, "yyyy-MM-dd") : undefined
      const to = date?.to ? format(date.to, "yyyy-MM-dd") : undefined
      const data = await getSavingsReport(undefined, from, to)
      setTransactions(data)
    } catch (err) {
      console.error("Failed to load savings:", err)
    } finally {
      setLoading(false)
    }
  }, [date])

  React.useEffect(() => {
    load()
  }, [load])

  const handleReset = () => {
    setDate(undefined)
  }



  // Calculate stats from real data
  const totalDeposits = transactions
    .filter(t => t.type === 'deposit')
    .reduce((acc, t) => acc + Number(t.amount), 0)
  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal')
    .reduce((acc, t) => acc + Number(t.amount), 0)
  const totalSavings = totalDeposits - totalWithdrawals

  // Savings breakdown
  const savingsBreakdown = transactions.reduce((acc, t) => {
    const amount = Number(t.amount)
    const isDeposit = t.type === 'deposit'
    const productName = t.savings_products?.name?.toLowerCase() || ''

    if (productName.includes('pokok')) {
      acc.pokok += isDeposit ? amount : -amount
    } else if (productName.includes('wajib')) {
      acc.wajib += isDeposit ? amount : -amount
    } else {
      acc.sukarela += isDeposit ? amount : -amount
    }
    return acc
  }, { pokok: 0, wajib: 0, sukarela: 0 })

  const columns = [
    { 
      accessorKey: "created_at", 
      header: "Tanggal",
      cell: ({ row }: { row: any }) => (
        <span className="font-mono text-xs">
          {new Date(row.getValue("created_at")).toLocaleDateString('id-ID')}
        </span>
      )
    },
    { 
      accessorKey: "members", 
      header: "Anggota",
      cell: ({ row }: { row: any }) => (
        <span className="font-medium">{row.original.members?.full_name || '-'}</span>
      )
    },
    { 
      accessorKey: "type", 
      header: "Tipe",
      cell: ({ row }: { row: any }) => <StatusBadge status={row.getValue("type")} />
    },
    { 
      accessorKey: "savings_products", 
      header: "Produk",
      cell: ({ row }: { row: any }) => (
        <span>{row.original.savings_products?.name || '-'}</span>
      )
    },
    { 
      accessorKey: "amount", 
      header: "Nominal",
      cell: ({ row }: { row: any }) => (
        <span className={row.original.type === "withdrawal" ? "text-red-600 font-bold" : "text-emerald-600 font-bold"}>
          {row.original.type === "withdrawal" ? "-" : "+"}{formatIDR(Number(row.getValue("amount")))}
        </span>
      )
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Simpanan</h1>
          <p className="text-muted-foreground">Monitoring total tabungan anggota dan riwayat transaksi.</p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <DatePickerWithRange 
            date={date} 
            onDateChange={setDate} 
          />
          {date && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleReset}
              className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl border border-border/50 bg-background/60 backdrop-blur-xl"
              title="Reset filter"
            >
              <FilterX className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Laporan
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/simpanan/setor" />}
          >
              <PlusCircle className="mr-2 h-4 w-4" />
              Setor / Tarik
          </Button>
        </div>
      </div>

      {date?.from && (
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] font-semibold text-primary uppercase tracking-wide flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Filter Aktif: {format(date.from, "dd MMM yyyy")} {date.to ? `— ${format(date.to, "dd MMM yyyy")}` : ""}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Simpanan"
          value={loading ? "..." : formatIDR(totalSavings)}
          description="Seluruh akumulasi dana"
          icon={Wallet}
        />
        <StatCard
          title="Total Setoran"
          value={loading ? "..." : formatIDR(totalDeposits)}
          description="Semua dana masuk"
          icon={TrendingUp}
        />
        <StatCard
          title="Total Penarikan"
          value={loading ? "..." : formatIDR(totalWithdrawals)}
          description="Semua dana keluar"
          icon={History}
        />
        <StatCard
          title="Jumlah Transaksi"
          value={loading ? "..." : transactions.length.toString()}
          description="Total transaksi tercatat"
          icon={ArrowUpRight}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-md md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Rincian Simpanan</CardTitle>
            <CardDescription>Detail per kategori simpanan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-muted-foreground">Simpanan Pokok</p>
                <p className="text-lg font-bold">
                  {loading ? "..." : formatIDR(savingsBreakdown.pokok)}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            
            <div className="flex items-center justify-between border-t pt-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-muted-foreground">Simpanan Wajib</p>
                <p className="text-lg font-bold">
                  {loading ? "..." : formatIDR(savingsBreakdown.wajib)}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-green-600" />
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-muted-foreground">Simpanan Sukarela</p>
                <p className="text-lg font-bold">
                  {loading ? "..." : formatIDR(savingsBreakdown.sukarela)}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md md:col-span-2">
          <CardHeader>
            <CardTitle>Transaksi Simpanan Terbaru</CardTitle>
            <CardDescription>Daftar setoran dan penarikan yang baru saja dilakukan.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <p className="text-muted-foreground animate-pulse">Memuat data simpanan...</p>
              </div>
            ) : (
              <DataTable columns={columns} data={transactions} searchKey="members" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
