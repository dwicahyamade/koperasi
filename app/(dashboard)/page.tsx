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
import { formatIDR } from "@/lib/utils"
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
    savingsBreakdown: {
      pokok: 0,
      wajib: 0,
      sukarela: 0
    },
    totalActiveLoans: 0,
    currentCash: 0,
  })
  const [loading, setLoading] = React.useState(true)
  
  const loadStats = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await getDashboardStats()
      setStats(data as any)
    } catch (err) {
      console.error("Failed to load stats:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadStats()
  }, [loadStats])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Ringkasan keuangan dan aktivitas koperasi.
          </p>
        </div>
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
                  {loading ? "..." : formatIDR(stats.savingsBreakdown.pokok)}
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
                  {loading ? "..." : formatIDR(stats.savingsBreakdown.wajib)}
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
                  {loading ? "..." : formatIDR(stats.savingsBreakdown.sukarela)}
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
      </div>

      <div className="grid gap-6">
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
