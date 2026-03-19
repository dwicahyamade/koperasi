"use client"

import * as React from "react"
import { 
  Users, 
  Wallet, 
  Landmark, 
  ArrowLeftRight, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight
} from "lucide-react"

import { StatCard } from "@/components/stat-card"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getDashboardStats } from "@/lib/actions/accounting"

export default function DashboardPage() {
  const [stats, setStats] = React.useState({
    memberCount: 0,
    totalSavings: 0,
    totalActiveLoans: 0,
    currentCash: 0,
  })
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardStats()
        setStats(data)
      } catch (err) {
        console.error("Failed to load stats:", err)
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Ringkasan keuangan dan aktivitas koperasi.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Anggota"
          value={loading ? "..." : stats.memberCount.toString()}
          description="Anggota terdaftar"
          icon={Users}
        />
        <StatCard
          title="Total Simpanan"
          value={loading ? "..." : formatIDR(stats.totalSavings)}
          description="Seluruh dana tabungan"
          icon={Wallet}
        />
        <StatCard
          title="Pinjaman Berjalan"
          value={loading ? "..." : formatIDR(stats.totalActiveLoans)}
          description="Total pinjaman aktif"
          icon={Landmark}
        />
        <StatCard
          title="Saldo Kas"
          value={loading ? "..." : formatIDR(stats.currentCash)}
          description="Dana tersedia di kas"
          icon={ArrowLeftRight}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Tren Simpanan</CardTitle>
            </div>
            <CardDescription>Grafik pertumbuhan simpanan (segera hadir)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[200px] text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              <p className="text-sm">Grafik akan ditampilkan setelah data mencukupi</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-primary" />
              <CardTitle>Arus Kas</CardTitle>
            </div>
            <CardDescription>Perbandingan pemasukan vs pengeluaran</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-[200px] text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              <p className="text-sm">Grafik akan ditampilkan setelah data mencukupi</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
