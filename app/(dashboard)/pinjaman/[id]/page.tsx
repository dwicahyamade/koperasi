"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  ChevronLeft, 
  Download, 
  Calendar, 
  CreditCard, 
  TrendingDown,
  Clock,
  CheckCircle2,
  Printer
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatIDR } from "@/lib/utils"
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
import { PaymentDialog } from "@/components/loan/payment-dialog"

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const [loan, setLoan] = React.useState<any>(null)
  const [installments, setInstallments] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false)
  const [selectedInstallment, setSelectedInstallment] = React.useState<any>(null)

  React.useEffect(() => {
    async function load() {
      const supabase = createClient()
      try {
        const { data: loanData, error: loanError } = await supabase
          .from('loans')
          .select('*, members(full_name, kta_number), loan_products(name)')
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
        console.error("Failed to load loan:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])



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
  const totalPaid = installments.filter(i => i.paid_at !== null).reduce((acc, i) => acc + Number(i.paid_amount), 0)
  const remainingBalance = Number(loan.principal) - installments.filter(i => i.paid_at !== null).reduce((acc, i) => acc + Number(i.principal_amount), 0)
  const monthlyPayment = installments.length > 0 ? Number(installments[0].principal_amount) + Number(installments[0].interest_amount) : 0

  const handlePayNext = () => {
    const nextUnpaid = installments.find(i => i.paid_at === null)
    if (nextUnpaid) {
      setSelectedInstallment(nextUnpaid)
      setIsPaymentDialogOpen(true)
    }
  }

  const handlePaySpecific = (inst: any) => {
    setSelectedInstallment(inst)
    setIsPaymentDialogOpen(true)
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
            <span className="text-muted-foreground font-mono">{loan.members?.full_name || '-'}</span>
            <StatusBadge status={loan.status} />
          </div>
        </div>
        <div className="ml-auto flex gap-2">
           <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Cetak Transaksi
           </Button>
           <Button onClick={handlePayNext} disabled={!installments.some(i => i.paid_at === null)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Bayar Angsuran
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Sisa Pokok"
          value={formatIDR(Math.max(0, remainingBalance))}
          description="Total kewajiban tersisa"
          icon={TrendingDown}
          className="bg-primary/5 border-primary/20 shadow-none text-primary"
        />
        <StatCard
          title="Angsuran / Bln"
          value={formatIDR(monthlyPayment)}
          description={`Pokok + Bunga (${loan.interest_rate}%)`}
          icon={Calendar}
          className="shadow-none"
        />
        <StatCard
          title="Progress Bayar"
          value={`${paidCount}/${loan.tenor_months}`}
          description="Jumlah bulan terbayar"
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
                  <span className="font-bold">{loan.members?.full_name || '-'}</span>
               </div>
               <div className="flex justify-between text-sm py-2 border-b">
                  <span className="text-muted-foreground">Produk</span>
                  <span className="font-medium">{loan.loan_products?.name || '-'}</span>
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
                  <span className="font-medium">{loan.interest_rate}% Flat / bln</span>
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
               <CardTitle>Kartu Piutang (Jadwal Angsuran)</CardTitle>
               <CardDescription>Daftar riwayat dan rencana pembayaran angsuran.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="rounded-md border overflow-hidden">
                  <Table>
                     <TableHeader className="bg-muted/50">
                        <TableRow>
                           <TableHead className="w-16">Ke-</TableHead>
                           <TableHead>Tgl Tagihan</TableHead>
                           <TableHead>Pokok</TableHead>
                           <TableHead>Bunga</TableHead>
                           <TableHead>Total</TableHead>
                           <TableHead>Status</TableHead>
                           <TableHead>Tgl Bayar</TableHead>
                           <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {installments.length > 0 ? installments.map((inst) => (
                           <TableRow key={inst.id}>
                              <TableCell className="font-bold">#{inst.installment_number}</TableCell>
                              <TableCell className="font-mono text-xs">{new Date(inst.due_date).toLocaleDateString('id-ID')}</TableCell>
                              <TableCell>{formatIDR(Number(inst.principal_amount))}</TableCell>
                              <TableCell>{formatIDR(Number(inst.interest_amount))}</TableCell>
                              <TableCell className="font-bold">{formatIDR(Number(inst.principal_amount) + Number(inst.interest_amount))}</TableCell>
                              <TableCell>
                                 {inst.paid_at ? (
                                    <Badge className="bg-emerald-500 hover:bg-emerald-600">Lunas</Badge>
                                 ) : (
                                    <Badge variant="outline" className="text-amber-600 border-amber-300">Belum Bayar</Badge>
                                 )}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground font-mono">
                                 {inst.paid_at ? new Date(inst.paid_at).toLocaleDateString('id-ID') : "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                 {!inst.paid_at && (
                                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handlePaySpecific(inst)}>
                                       Bayar
                                    </Button>
                                 )}
                              </TableCell>
                           </TableRow>
                        )) : (
                           <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                 Belum ada jadwal angsuran. Pinjaman perlu dicairkan terlebih dahulu.
                              </TableCell>
                           </TableRow>
                        )}
                     </TableBody>
                  </Table>
               </div>
            </CardContent>
         </Card>
      </div>

      <PaymentDialog 
        isOpen={isPaymentDialogOpen}
        onClose={() => {
          setIsPaymentDialogOpen(false)
          setSelectedInstallment(null)
          // Refresh data (useEffect will trigger if we refresh the page or use router.refresh but for client side state we might need more)
          // However, the recordInstallmentPayment action calls revalidatePath, 
          // but we are using client-side fetching here. Let's add a manual reload or update state.
          window.location.reload()
        }}
        installment={selectedInstallment}
        memberName={loan.members?.full_name || '-'}
      />
    </div>
  )
}
