"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Plus, 
  Eye, 
  CheckCircle, 
  XCircle, 
  HandCoins,
  MoreHorizontal
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { formatIDR } from "@/lib/utils"
import { DataTable } from "@/components/data-table"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/status-badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { approveLoan, disburseLoan } from "@/lib/actions/loans"
import { toast } from "sonner"

export default function LoansPage() {
  const [loans, setLoans] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  async function loadLoans() {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*, members(full_name)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setLoans(data || [])
    } catch (err) {
      console.error("Failed to load loans:", err)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadLoans()
  }, [])



  const handleApprove = async (loanId: string) => {
    try {
      await approveLoan(loanId)
      toast.success("Pinjaman Disetujui")
      loadLoans()
    } catch (err: any) {
      toast.error("Gagal menyetujui", { description: err.message })
    }
  }

  const handleDisburse = async (loanId: string) => {
    try {
      await disburseLoan(loanId)
      toast.success("Pinjaman Dicairkan")
      loadLoans()
    } catch (err: any) {
      toast.error("Gagal mencairkan", { description: err.message })
    }
  }

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
      accessorKey: "borrower_name", 
      header: "Peminjam",
      cell: ({ row }: { row: any }) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm leading-none">{row.getValue("borrower_name") || '-'}</span>
          <span className="text-[10px] text-muted-foreground mt-1">
            Anggota: {row.original.members?.full_name || '-'}
          </span>
        </div>
      )
    },
    { 
      accessorKey: "principal", 
      header: "Nominal",
      cell: ({ row }: { row: any }) => (
        <span className="font-bold">{formatIDR(Number(row.getValue("principal")))}</span>
      )
    },
    { 
      accessorKey: "interest_type", 
      header: "Skema",
      cell: ({ row }: { row: any }) => (
        <Badge variant="outline" className="capitalize text-[10px]">
          {row.getValue("interest_type") === 'effective' ? 'Efektif' : 'Flat'}
        </Badge>
      )
    },
    { 
      accessorKey: "tenor_months", 
      header: "Tenor",
      cell: ({ row }: { row: any }) => `${row.getValue("tenor_months")} bln`
    },
    { 
      accessorKey: "status", 
      header: "Status",
      cell: ({ row }: { row: any }) => <StatusBadge status={row.getValue("status")} />
    },
    {
      id: "actions",
      cell: ({ row }: { row: any }) => {
        const loan = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 p-0")}
            >
                <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi Pinjaman</DropdownMenuLabel>
              <DropdownMenuItem
                nativeButton={false}
                render={<Link href={`/pinjaman/${loan.id}`} />}
              >
                  <Eye className="mr-2 h-4 w-4" />
                  Detail & Kartu Piutang
              </DropdownMenuItem>
              {loan.status === "pending" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-blue-600" onClick={() => handleApprove(loan.id)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Setujui (Approve)
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Tolak (Reject)
                  </DropdownMenuItem>
                </>
              )}
              {loan.status === "approved" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-emerald-600" onClick={() => handleDisburse(loan.id)}>
                    <HandCoins className="mr-2 h-4 w-4" />
                    Cairkan Dana
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Pinjaman</h1>
          <p className="text-muted-foreground">Monitor pengajuan, persetujuan, dan pencairan dana pinjaman.</p>
        </div>
        <div className="flex gap-2">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/pinjaman/simulasi" />}
            >
                <Eye className="mr-2 h-4 w-4" />
                Simulasi
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/pinjaman/pengajuan" />}
            >
                <Plus className="mr-2 h-4 w-4" />
                Ajukan Pinjaman
            </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-muted/50 p-1 flex-wrap h-auto">
          <TabsTrigger value="all">Semua</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="disbursed">Cair / Berjalan</TabsTrigger>
          <TabsTrigger value="closed">Lunas</TabsTrigger>
        </TabsList>

        <Card className="shadow-md">
          <CardHeader className="pb-3 px-6 pt-6">
            <CardTitle>Daftar Pinjaman Koperasi</CardTitle>
            <CardDescription>Status terkini seluruh pinjaman anggota.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <p className="text-muted-foreground animate-pulse">Memuat data pinjaman...</p>
              </div>
            ) : (
              <>
                <TabsContent value="all" className="m-0 border-0 p-0">
                  <DataTable columns={columns} data={loans} searchKey="borrower_name" />
                </TabsContent>
                <TabsContent value="pending" className="m-0 border-0 p-0">
                  <DataTable columns={columns} data={loans.filter(l => l.status === "pending")} searchKey="borrower_name" />
                </TabsContent>
                <TabsContent value="approved" className="m-0 border-0 p-0">
                  <DataTable columns={columns} data={loans.filter(l => l.status === "approved")} searchKey="borrower_name" />
                </TabsContent>
                <TabsContent value="disbursed" className="m-0 border-0 p-0">
                  <DataTable columns={columns} data={loans.filter(l => l.status === "disbursed")} searchKey="borrower_name" />
                </TabsContent>
                <TabsContent value="closed" className="m-0 border-0 p-0">
                  <DataTable columns={columns} data={loans.filter(l => l.status === "closed")} searchKey="borrower_name" />
                </TabsContent>
              </>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
