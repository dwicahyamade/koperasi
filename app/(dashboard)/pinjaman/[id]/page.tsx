"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  ChevronLeft, 
  Download, 
  TrendingDown,
  Clock,
  CheckCircle2,
  Printer,
  Plus,
  Trash2,
  Calendar as CalendarIcon
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import { formatIDR, cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import { StatCard } from "@/components/stat-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CurrencyInput } from "@/components/currency-input"
import { addManualPayment, deleteInstallment as deleteInstallmentAction } from "@/lib/actions/loans"
import { calculateLoanSchedule } from "@/lib/loan-utils"

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const [loan, setLoan] = React.useState<any>(null)
  const [installments, setInstallments] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [manualDate, setManualDate] = React.useState<Date | undefined>(new Date())
  const [manualPrincipal, setManualPrincipal] = React.useState<string>("")
  const [manualInterest, setManualInterest] = React.useState<string>("")
  const [isAdding, setIsAdding] = React.useState(false)

  const loadData = React.useCallback(async () => {
    const supabase = createClient()
    try {
      const { data: loanData, error: loanError } = await supabase
        .from('loans')
        .select('*, members(full_name, kta_number)')
        .eq('id', id)
        .single()

      if (loanError) throw loanError
      setLoan(loanData)

      const { data: instData } = await supabase
        .from('loan_installments')
        .select('*')
        .eq('loan_id', id)
        .order('installment_number', { ascending: true })

      setInstallments(instData || [])
    } catch (err) {
      console.error("Failed to load data:", err)
    } finally {
      setLoading(false)
    }
  }, [id])

  React.useEffect(() => {
    loadData()
  }, [loadData])



  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Memuat data pinjaman...</div>
      </div>
    )
  }

  if (!loan) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Pinjaman tidak ditemukan.</p>
        <Button variant="outline" onClick={() => router.back()}>Kembali</Button>
      </div>
    )
  }

  const paidCount = installments.filter(i => i.paid_at !== null).length
  const totalPrincipalPaid = installments.filter(i => i.paid_at !== null).reduce((acc, i) => acc + Number(i.principal_amount), 0)
  const totalInterestPaid = installments.filter(i => i.paid_at !== null).reduce((acc, i) => acc + Number(i.interest_amount), 0)
  const totalPaid = totalPrincipalPaid + totalInterestPaid
  const remainingBalance = Number(loan.principal) - totalPrincipalPaid
  
  // Accurate estimation using utility
  const schedule = calculateLoanSchedule(
    Number(loan.principal),
    Number(loan.interest_rate),
    loan.tenor_months,
    loan.interest_type as any
  )
  const totalLoanLiability = schedule.totalPayment
  const remainingTotal = Math.max(0, totalLoanLiability - totalPaid)
  
  const monthlyPayment = installments.length > 0 ? Number(installments[0].principal_amount) + Number(installments[0].interest_amount) : 0

  const handleAddManual = async () => {
    if (!manualDate || (!manualPrincipal && !manualInterest)) return
    setIsAdding(true)
    try {
      const result = await addManualPayment(
        id, 
        manualDate.toISOString().split('T')[0], 
        Number(manualPrincipal) || 0,
        Number(manualInterest) || 0
      )
      if (result.success) {
        toast.success("Catatan piutang berhasil ditambahkan")
        setManualPrincipal("")
        setManualInterest("")
        loadData()
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menambahkan catatan")
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (instId: string) => {
    if (!confirm("Hapus catatan ini?")) return
    try {
      const result = await deleteInstallmentAction(instId)
      if (result.success) {
        toast.success("Catatan piutang berhasil dihapus")
        loadData()
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus catatan")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Detail Pinjaman</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-muted-foreground font-medium">{loan.borrower_name || '-'}</span>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-[10px] text-muted-foreground">Anggota: {loan.members?.full_name || '-'}</span>
            <StatusBadge status={loan.status} />
          </div>
        </div>
        <div className="ml-auto flex gap-2">
           <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Cetak Transaksi
           </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
         <StatCard
           title="Sisa Total"
           value={formatIDR(remainingTotal)}
           description="Estimasi Pokok + Bunga"
           icon={TrendingDown}
           className="bg-primary/5 border-primary/20 shadow-none text-primary"
         />
        <StatCard
          title="Sisa Pokok"
          value={formatIDR(Math.max(0, remainingBalance))}
          description="Kewajiban pokok saja"
          icon={TrendingDown}
          className="shadow-none"
        />
        <StatCard
          title="Total Masuk"
          value={formatIDR(totalPaid)}
          description={`P: ${formatIDR(totalPrincipalPaid)} | B: ${formatIDR(totalInterestPaid)}`}
          icon={CheckCircle2}
          className="shadow-none"
        />
        <StatCard
          title="Progress"
          value={`${paidCount}/${loan.tenor_months} Bln`}
          description={`${loan.interest_type === 'effective' ? 'Bunga Menurun' : 'Bunga Tetap'}`}
          icon={Clock}
          className="shadow-none"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
         <Card className="lg:col-span-1 shadow-md">
            <CardHeader>
               <CardTitle className="text-lg">Informasi Pinjaman</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Peminjam</span>
                  <span className="font-bold">{loan.borrower_name || '-'}</span>
               </div>
               <div className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Anggota</span>
                  <span className="font-medium">{loan.members?.full_name || '-'}</span>
               </div>
               <div className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Skema Bunga</span>
                  <Badge variant="outline" className="capitalize">
                    {loan.interest_type === 'effective' ? 'Efektif' : 'Flat'}
                  </Badge>
               </div>
               <div className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Tanggal Cair</span>
                  <span className="font-medium">{loan.disbursed_at ? new Date(loan.disbursed_at).toLocaleDateString('id-ID') : 'Belum cair'}</span>
               </div>
               <div className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Total Pinjaman</span>
                  <span className="font-bold">{formatIDR(Number(loan.principal))}</span>
               </div>
               <div className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Tenor</span>
                  <span className="font-medium">{loan.tenor_months} Bulan</span>
               </div>
               <div className="flex justify-between text-sm py-2">
                  <span className="text-muted-foreground">Suku Bunga</span>
                  <span className="font-medium">{loan.interest_rate}% / bln</span>
               </div>
               
               <div className="pt-4">
                  <div className={`p-3 rounded-lg ${paidCount > 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                     <div className="flex gap-2 items-center">
                        <CheckCircle2 className={`h-4 w-4 ${paidCount > 0 ? 'text-emerald-600' : 'text-amber-600'}`} />
                        <span className={`text-sm font-bold ${paidCount > 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {paidCount > 0 ? 'Pembayaran Berjalan' : 'Belum Ada Pembayaran'}
                        </span>
                     </div>
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card className="lg:col-span-2 shadow-md">
            <CardHeader>
               <CardTitle>Kartu Piutang</CardTitle>
               <CardDescription>Catatan riwayat pembayaran dan tagihan secara manual.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="mb-6 p-4 border rounded-lg bg-muted/30">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Input Manual</p>
                   <div className="flex flex-wrap items-end gap-3">
                      <div className="space-y-1.5 flex-1">
                         <label className="text-[10px] font-bold uppercase text-muted-foreground">Tanggal</label>
                         <Popover>
                            <PopoverTrigger 
                               className={cn(
                                  buttonVariants({ variant: "outline" }), 
                                  "w-[180px] justify-start text-left font-normal h-10"
                               )}
                            >
                               <CalendarIcon className="mr-2 h-4 w-4" />
                               {manualDate ? format(manualDate, "dd MMM yyyy") : <span>Pilih Tgl</span>}
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                               <Calendar mode="single" selected={manualDate} onSelect={setManualDate} initialFocus />
                            </PopoverContent>
                         </Popover>
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-[100px]">
                         <label className="text-[10px] font-bold uppercase text-muted-foreground">Bayar Pokok</label>
                         <CurrencyInput 
                            value={manualPrincipal} 
                            onValueChange={setManualPrincipal} 
                            placeholder="Rp 0"
                            className="h-10"
                         />
                      </div>
                      <div className="space-y-1.5 flex-1 min-w-[100px]">
                         <label className="text-[10px] font-bold uppercase text-muted-foreground">Bayar Bunga</label>
                         <CurrencyInput 
                            value={manualInterest} 
                            onValueChange={setManualInterest} 
                            placeholder="Rp 0"
                            className="h-10"
                         />
                      </div>
                      <Button 
                         onClick={handleAddManual} 
                         disabled={!manualDate || (!manualPrincipal && !manualInterest) || isAdding}
                         className="h-10 px-6"
                      >
                         {isAdding ? "Menyimpan..." : (
                            <>
                               <Plus className="h-4 w-4 mr-2" />
                               Tambah Catatan
                            </>
                         )}
                      </Button>
                   </div>
               </div>

               <div className="rounded-md border overflow-hidden">
                  <Table>
                     <TableHeader className="bg-muted/50">
                         <TableRow>
                            <TableHead className="w-16">Ke-</TableHead>
                            <TableHead>Tanggal</TableHead>
                            <TableHead className="text-right">Pokok</TableHead>
                            <TableHead className="text-right">Bunga</TableHead>
                            <TableHead className="text-right">Total Bayar</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                         </TableRow>
                     </TableHeader>
                     <TableBody>
                        {installments.length > 0 ? installments.map((inst) => (
                           <TableRow key={inst.id}>
                              <TableCell className="font-bold">#{inst.installment_number}</TableCell>
                              <TableCell className="font-mono text-xs">
                                 {format(new Date(inst.due_date), 'dd/MM/yyyy')}
                              </TableCell>
                               <TableCell className="text-right font-mono text-xs">{formatIDR(inst.principal_amount)}</TableCell>
                               <TableCell className="text-right font-mono text-xs">{formatIDR(inst.interest_amount)}</TableCell>
                               <TableCell className="text-right font-bold text-emerald-600">{formatIDR(inst.paid_amount)}</TableCell>
                              <TableCell className="text-right">
                                 <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(inst.id)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                 </Button>
                              </TableCell>
                           </TableRow>
                        )) : (
                           <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                 Belum ada catatan piutang. Silakan tambah secara manual atau cairkan pinjaman.
                              </TableCell>
                           </TableRow>
                        )}
                     </TableBody>
                  </Table>
               </div>
            </CardContent>
         </Card>
      </div>

    </div>
  )
}
