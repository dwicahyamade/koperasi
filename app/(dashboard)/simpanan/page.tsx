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
  Download
} from "lucide-react"

import { Button } from "@/components/ui/button"
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

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getSavingsReport()
        setTransactions(data)
      } catch (err) {
        console.error("Failed to load savings:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val)
  }

  // Calculate stats from real data
  const totalDeposits = transactions
    .filter(t => t.type === 'deposit')
    .reduce((acc, t) => acc + Number(t.amount), 0)
  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdrawal')
    .reduce((acc, t) => acc + Number(t.amount), 0)
  const totalSavings = totalDeposits - totalWithdrawals

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Simpanan</h1>
          <p className="text-muted-foreground">Monitoring total tabungan anggota dan riwayat transaksi.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline">
             <Download className="mr-2 h-4 w-4" />
             Laporan Simpanan
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Simpanan"
          value={formatIDR(totalSavings)}
          description="Seluruh akumulasi dana"
          icon={Wallet}
        />
        <StatCard
          title="Total Setoran"
          value={formatIDR(totalDeposits)}
          description="Semua dana masuk"
          icon={TrendingUp}
        />
        <StatCard
          title="Total Penarikan"
          value={formatIDR(totalWithdrawals)}
          description="Semua dana keluar"
          icon={History}
        />
        <StatCard
          title="Jumlah Transaksi"
          value={transactions.length.toString()}
          description="Total transaksi tercatat"
          icon={ArrowUpRight}
        />
      </div>

      <Card className="shadow-md">
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
  )
}
