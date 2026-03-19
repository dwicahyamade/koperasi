"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ChevronLeft, Loader2, Save, Calculator, Landmark } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { Separator } from "@/components/ui/separator"
import { requestLoan, getLoanProducts } from "@/lib/actions/loans"

const formSchema = z.object({
  member_id: z.string().min(1, {
    message: "Harap pilih anggota.",
  }),
  product_id: z.string().min(1, {
    message: "Harap pilih produk pinjaman.",
  }),
  amount: z.string().min(1, {
    message: "Harap masukkan nominal pinjaman.",
  }),
  tenor: z.string().min(1, {
    message: "Harap pilih tenor.",
  }),
})

export default function LoanApplicationPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [products, setProducts] = React.useState<any[]>([])

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getLoanProducts()
        setProducts(data)
      } catch (err) {
        console.error("Failed to load loan products:", err)
      }
    }
    load()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      member_id: "",
      product_id: "",
      amount: "",
      tenor: "12",
    },
  })

  // Watch values for simulation
  const amount = form.watch("amount")
  const tenor = form.watch("tenor")
  const selectedProductId = form.watch("product_id")
  
  const selectedProduct = products.find(p => p.id === selectedProductId)
  const interestRate = selectedProduct ? Number(selectedProduct.interest_rate) / 100 : 0.015

  const simulation = React.useMemo(() => {
    const p = parseFloat(amount || "0")
    const t = parseInt(tenor || "0")
    if (!p || !t) return null
    
    const interestPerMonth = p * interestRate
    const principalPerMonth = p / t
    const totalPerMonth = principalPerMonth + interestPerMonth
    
    return {
      principal: principalPerMonth,
      interest: interestPerMonth,
      total: totalPerMonth,
      grandTotal: totalPerMonth * t
    }
  }, [amount, tenor, interestRate])

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const product = products.find(p => p.id === values.product_id)
      
      await requestLoan({
        member_id: values.member_id,
        product_id: values.product_id,
        principal: parseFloat(values.amount),
        interest_rate: product ? Number(product.interest_rate) : 1.5,
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Pengajuan Pinjaman Baru</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              Detail Pengajuan
            </CardTitle>
            <CardDescription>
              Lengkapi formulir untuk mengajukan pinjaman baru.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="member_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Anggota</FormLabel>
                      <MemberCombobox value={field.value} onValueChange={field.onChange} disabled={isLoading} />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="product_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produk Pinjaman</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih produk">
                              {field.value 
                                ? products.find((p) => p.id === field.value)?.name 
                                : "Pilih produk"}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} ({Number(p.interest_rate)}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nominal</FormLabel>
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
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih tenor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[3, 6, 12, 18, 24, 36].map((m) => (
                              <SelectItem key={m} value={String(m)}>{m} Bulan</SelectItem>
                            ))}
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
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Ajukan Sekarang
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border shadow-lg bg-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Calculator className="h-5 w-5" />
              Estimasi Angsuran
            </CardTitle>
            <CardDescription>
              Perhitungan estimasi berdasarkan skema bunga flat.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {simulation ? (
              <div className="space-y-4">
                <div className="bg-white/40 dark:bg-black/40 p-4 rounded-xl border-2 border-primary/10">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Angsuran per Bulan</p>
                  <p className="text-3xl font-black text-primary">{formatIDR(simulation.total)}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pokok per Bulan</span>
                    <span className="font-medium">{formatIDR(simulation.principal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bunga ({selectedProduct ? `${Number(selectedProduct.interest_rate)}%` : '1.5%'})</span>
                    <span className="font-medium">{formatIDR(simulation.interest)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total Pengembalian</span>
                    <span className="text-indigo-600">{formatIDR(simulation.grandTotal)}</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                   <p className="text-xs text-amber-700 leading-relaxed italic">
                     *Angka di atas hanya perkiraan. Perhitungan final mungkin menyertakan biaya administrasi atau provisi sesuai kebijakan produk.
                   </p>
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
                <Calculator className="h-12 w-12 opacity-10 mb-2" />
                <p className="text-sm">Masukkan nominal dan tenor untuk simulasi.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
