"use client"

import * as React from "react"
import Link from "next/link"
import {
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  HandCoins,
  MoreHorizontal,
  Trash2
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getLoans, approveLoan, disburseLoan, getAllInstallments, deleteLoan } from "@/lib/actions/loans"
import { toast } from "sonner"

export default function LoansPage() {
  const [loans, setLoans] = React.useState<any[]>([])
  const [installments, setInstallments] = React.useState<any[]>([])
  const [historySearch, setHistorySearch] = React.useState("")
  const [loading, setLoading] = React.useState(true)

  async function loadLoans() {
    try {
      const [loansData, instData] = await Promise.all([getLoans(), getAllInstallments()])
      setLoans(loansData || [])
      setInstallments(instData || [])
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

  const handleDelete = async (loanId: string) => {
    if (!confirm("Hapus pinjaman ini beserta seluruh riwayat pembayaran dan entri buku kas terkait?")) return
    try {
      await deleteLoan(loanId)
      toast.success("Pinjaman Dihapus")
      loadLoans()
    } catch (err: any) {
      toast.error("Gagal menghapus", { description: err.message })
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
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(loan.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus Pinjaman
              </DropdownMenuItem>
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
          <TabsTrigger value="history">Riwayat Pembayaran</TabsTrigger>
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
                  <DataTable columns={columns} data={loans} searchKey="borrower_name" searchPlaceholder="Cari Peminjam..." />
                </TabsContent>
                <TabsContent value="pending" className="m-0 border-0 p-0">
                  <DataTable columns={columns} data={loans.filter(l => l.status === "pending")} searchKey="borrower_name" searchPlaceholder="Cari Peminjam..." />
                </TabsContent>
                <TabsContent value="approved" className="m-0 border-0 p-0">
                  <DataTable columns={columns} data={loans.filter(l => l.status === "approved")} searchKey="borrower_name" searchPlaceholder="Cari Peminjam..." />
                </TabsContent>
                <TabsContent value="disbursed" className="m-0 border-0 p-0">
                  <DataTable columns={columns} data={loans.filter(l => l.status === "disbursed")} searchKey="borrower_name" searchPlaceholder="Cari Peminjam..." />
                </TabsContent>
                <TabsContent value="closed" className="m-0 border-0 p-0">
                  <DataTable columns={columns} data={loans.filter(l => l.status === "closed")} searchKey="borrower_name" searchPlaceholder="Cari Peminjam..." />
                </TabsContent>
                <TabsContent value="history" className="m-0 border-0 p-0">
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Cari peminjam..."
                      value={historySearch}
                      onChange={e => setHistorySearch(e.target.value)}
                      className="flex h-9 w-full max-w-sm rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>Ke-</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Peminjam</TableHead>
                          <TableHead className="text-right">Pokok</TableHead>
                          <TableHead className="text-right">Bunga</TableHead>
                          <TableHead className="text-right">Total Bayar</TableHead>
                          <TableHead className="text-right">Detail</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          const q = historySearch.toLowerCase()
                          const filtered = q ? installments.filter(inst =>
                            inst.loans?.borrower_name?.toLowerCase().includes(q) || inst.loans?.members?.full_name?.toLowerCase().includes(q)
                          ) : installments
                          return filtered.length > 0 ? filtered.map((inst) => (
                          <TableRow key={inst.id}>
                            <TableCell className="font-bold">#{inst.installment_number}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {new Date(inst.due_date).toLocaleDateString('id-ID')}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-sm leading-none">{inst.loans?.borrower_name || '-'}</span>
                                <span className="text-[10px] text-muted-foreground mt-1">{inst.loans?.members?.full_name || '-'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">{formatIDR(inst.principal_amount)}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{formatIDR(inst.interest_amount)}</TableCell>
                            <TableCell className="text-right font-bold text-emerald-600">{formatIDR(inst.paid_amount)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                nativeButton={false}
                                render={<Link href={`/pinjaman/${inst.loan_id}`} />}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                Lihat
                              </Button>
                            </TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              Belum ada riwayat pembayaran.
                            </TableCell>
                          </TableRow>
                        )
                        })()}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
