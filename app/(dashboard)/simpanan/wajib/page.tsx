"use client"

import * as React from "react"
import { 
  CalendarDays, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Loader2
} from "lucide-react"

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
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { addSavingsTransaction, getSavingsProducts } from "@/lib/actions/savings"
import { getMembers } from "@/lib/actions/members"

export default function MandatorySavingsPage() {
  const [unpaidMembers, setUnpaidMembers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [processing, setProcessing] = React.useState(false)
  const [mandatoryProduct, setMandatoryProduct] = React.useState<any>(null)
  const [paidCount, setPaidCount] = React.useState(0)
  const [totalMembers, setTotalMembers] = React.useState(0)

  React.useEffect(() => {
    async function load() {
      try {
        const supabase = createClient()
        
        // Get mandatory savings product
        const products = await getSavingsProducts()
        const mandatory = products.find((p: any) => p.is_mandatory && p.name.toLowerCase().includes('wajib'))
        setMandatoryProduct(mandatory)

        // Get all active members
        const members = await getMembers()
        const activeMembers = members.filter((m: any) => m.status === 'active')
        setTotalMembers(activeMembers.length)

        if (!mandatory) {
          setUnpaidMembers(activeMembers)
          setLoading(false)
          return
        }

        // Get this month's mandatory savings
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
        
        const { data: paidThisMonth } = await supabase
          .from('savings_transactions')
          .select('member_id')
          .eq('product_id', mandatory.id)
          .eq('type', 'deposit')
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth)

        const paidIds = new Set((paidThisMonth || []).map((t: any) => t.member_id))
        setPaidCount(paidIds.size)

        const unpaid = activeMembers.filter((m: any) => !paidIds.has(m.id))
        setUnpaidMembers(unpaid)
      } catch (err) {
        console.error("Failed to load:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleProcessAll = async () => {
    if (!mandatoryProduct) {
      toast.error("Produk simpanan wajib belum dikonfigurasi.")
      return
    }
    
    setProcessing(true)
    try {
      let successCount = 0
      for (const member of unpaidMembers) {
        try {
          await addSavingsTransaction({
            member_id: member.id,
            product_id: mandatoryProduct.id,
            type: 'deposit',
            amount: Number(mandatoryProduct.minimum_amount),
            notes: `Simpanan wajib bulan ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`,
          })
          successCount++
        } catch (err) {
          console.error(`Failed for ${member.full_name}:`, err)
        }
      }
      
      toast.success(`Proses Selesai`, {
        description: `${successCount} dari ${unpaidMembers.length} anggota berhasil diproses.`,
      })
      
      // Reload
      window.location.reload()
    } catch (err: any) {
      toast.error("Gagal memproses", { description: err.message })
    } finally {
      setProcessing(false)
    }
  }



  const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  const columns = [
    { accessorKey: "kta_number", header: "KTA" },
    { 
      accessorKey: "full_name", 
      header: "Nama",
      cell: ({ row }: { row: any }) => <span className="font-medium">{row.getValue("full_name")}</span>
    },
    { accessorKey: "phone", header: "Telepon" },
    { 
      id: "amount",
      header: "Nominal Wajib",
      cell: () => (
        <span className="font-bold text-red-600">
          {mandatoryProduct ? formatIDR(Number(mandatoryProduct.minimum_amount)) : '-'}
        </span>
      )
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Simpanan Wajib</h1>
          <p className="text-muted-foreground">Monitoring iuran wajib bulanan anggota — {currentMonth}.</p>
        </div>
        <Button 
          onClick={handleProcessAll} 
          disabled={processing || unpaidMembers.length === 0}
        >
          {processing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 h-4 w-4" />
          )}
          {processing ? "Memproses..." : `Proses Masal (${unpaidMembers.length})`}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Sudah Bayar"
          value={paidCount.toString()}
          description={`Dari ${totalMembers} anggota aktif`}
          icon={CheckCircle2}
          className="bg-emerald-500/5 border-emerald-500/20 text-emerald-700 shadow-none"
        />
        <StatCard
          title="Belum Bayar"
          value={unpaidMembers.length.toString()}
          description="Anggota belum setor bulan ini"
          icon={AlertCircle}
          className="bg-red-500/5 border-red-500/20 text-red-700 shadow-none"
        />
        <StatCard
          title="Periode"
          value={currentMonth}
          description="Periode simpanan wajib aktif"
          icon={CalendarDays}
          className="shadow-none"
        />
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-red-500" />
            <CardTitle>Anggota Belum Bayar</CardTitle>
          </div>
          <CardDescription>Daftar anggota yang belum menyetorkan simpanan wajib bulan ini.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-muted-foreground animate-pulse">Memuat data...</p>
            </div>
          ) : (
            <DataTable columns={columns} data={unpaidMembers} searchKey="full_name" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
