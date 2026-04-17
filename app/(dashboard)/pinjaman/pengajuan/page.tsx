"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ChevronLeft, Loader2, Save, Calculator, Landmark, Percent, Clock } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
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
import { Input } from "@/components/ui/input"
import { MemberCombobox } from "@/components/member-combobox"
import { CurrencyInput } from "@/components/currency-input"
import { formatIDR } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { requestLoan } from "@/lib/actions/loans"
import { calculateLoanSchedule, InterestType } from "@/lib/loan-utils"
import { createClient } from "@/lib/supabase/client"

const formSchema = z.object({
  member_id: z.string().min(1, {
    message: "Harap pilih anggota.",
  }),
  borrower_name: z.string().min(1, {
    message: "Harap masukkan nama peminjam.",
  }),
  amount: z.string().min(1, {
    message: "Harap masukkan nominal pinjaman.",
  }),
  tenor: z.string().min(1, {
    message: "Harap masukkan tenor.",
  }),
  interest_rate: z.string().min(1, {
    message: "Harap masukkan bunga.",
  }),
  interest_type: z.enum(['flat', 'effective']),
})

export default function LoanApplicationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      member_id: "",
      borrower_name: "",
      amount: "",
      tenor: "12",
      interest_rate: "1.5",
      interest_type: "flat",
    },
  })

  // Watch for member_id to auto-fill borrower_name
  const memberId = form.watch("member_id")
  React.useEffect(() => {
    if (memberId) {
      const fetchMember = async () => {
        const supabase = createClient()
        const { data } = await supabase
          .from('members')
          .select('full_name')
          .eq('id', memberId)
          .single()
        
        if (data) {
          form.setValue("borrower_name", data.full_name)
        }
      }
      fetchMember()
    }
  }, [memberId, form])

  // Watch values for simulation
  const amount = form.watch("amount")
  const tenor = form.watch("tenor")
  const interestRateStr = form.watch("interest_rate")
  const interestType = form.watch("interest_type")
  
  const simulation = React.useMemo(() => {
    const p = parseFloat(amount || "0")
    const t = parseInt(tenor || "0")
    const r = parseFloat(interestRateStr || "0")
    if (!p || !t) return null
    
    return calculateLoanSchedule(p, r, t, interestType as InterestType)
  }, [amount, tenor, interestRateStr, interestType])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      await requestLoan({
        member_id: values.member_id,
        borrower_name: values.borrower_name,
        principal: parseFloat(values.amount),
        interest_rate: parseFloat(values.interest_rate),
        interest_type: values.interest_type,
        tenor_months: parseInt(values.tenor),
      })
      
      toast.success("Pengajuan Berhasil", {
        description: "Data sedang ditinjau oleh manajer.",
      })
      router.push("/pinjaman")
      router.refresh()
    } catch (error: any) {
      toast.error("Pengajuan Gagal", {
        description: error.message || "Terjadi kesalahan saat memproses pengajuan.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Pengajuan Pinjaman Baru</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              Detail Pengajuan
            </CardTitle>
            <CardDescription>
              Lengkapi formulir untuk mengajukan pinjaman baru dengan parameter kustom.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="member_id"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Pilih Anggota</FormLabel>
                        <MemberCombobox value={field.value} onValueChange={field.onChange} disabled={isLoading} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="borrower_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Peminjam</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama lengkap peminjam" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormDescription>Bisa disesuaikan jika berbeda dengan nama anggota.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nominal Pinjaman</FormLabel>
                        <FormControl>
                          <CurrencyInput 
                            placeholder="Rp 0" 
                            value={field.value} 
                            onValueChange={field.onChange} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tenor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tenor (Bulan)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              className="pr-16"
                              {...field} 
                              disabled={isLoading}
                            />
                            <div className="absolute right-3 top-2.5 text-xs text-muted-foreground font-bold">BULAN</div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="interest_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bunga (%) / Bulan</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type="number" 
                              step="0.01"
                              className="pr-12"
                              {...field} 
                              disabled={isLoading}
                            />
                            <div className="absolute right-3 top-2.5 text-xs text-muted-foreground font-bold">%</div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="interest_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Skema Bunga</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih skema" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="flat">Flat (Tetap)</SelectItem>
                            <SelectItem value="effective">Effective (Menurun)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={isLoading} className="min-w-[150px]">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Ajukan Sekarang
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="hidden lg:block lg:col-span-2 space-y-6">
          <Card className="border shadow-lg bg-primary/5 border-primary/10 overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Calculator className="h-5 w-5" />
                Preview Angsuran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {simulation ? (
                <div className="space-y-6">
                  <div className="bg-white/60 dark:bg-black/40 p-5 rounded-2xl border-2 border-primary/10 shadow-sm">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black mb-1">
                      {interestType === 'effective' ? 'Angsuran Pertama' : 'Angsuran / Bulan'}
                    </p>
                    <p className="text-4xl font-black text-primary">
                      {formatIDR(interestType === 'effective' ? simulation.installments[0].total : simulation.monthlyInstallment!)}
                    </p>
                  </div>
                  
                  <div className="space-y-3 px-1">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Pokok / Bulan</span>
                      </div>
                      <span className="font-bold">{formatIDR(simulation.installments[0].principal)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Percent className="h-3.5 w-3.5" />
                        <span>Bunga {interestType === 'effective' ? '(Bulan 1)' : ''}</span>
                      </div>
                      <span className="font-bold">{formatIDR(simulation.installments[0].interest)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center bg-white/40 dark:bg-black/20 p-3 rounded-lg">
                      <span className="font-bold text-xs uppercase tracking-wider">Total Pengembalian</span>
                      <span className="text-lg font-black text-indigo-600">{formatIDR(simulation.totalPayment)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                     <p className="text-[11px] text-amber-800 leading-relaxed italic font-medium">
                       *Perhitungan ini adalah estimasi awal. Nilai akhir mungkin berbeda jika terdapat biaya administrasi sesuai kebijakan koperasi.
                     </p>
                  </div>
                </div>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground/40 text-center p-6 border-2 border-dashed rounded-2xl border-primary/5">
                  <Calculator className="h-16 w-16 mb-4 opacity-10" />
                  <p className="text-sm font-medium">Lengkapi parameter pinjaman di sebelah kiri untuk melihat simulasi angsuran.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
