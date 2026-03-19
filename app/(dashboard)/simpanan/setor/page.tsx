"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ChevronLeft, Loader2, Save, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MemberCombobox } from "@/components/member-combobox"
import { CurrencyInput } from "@/components/currency-input"
import { cn } from "@/lib/utils"
import { addSavingsTransaction, getSavingsProducts } from "@/lib/actions/savings"

const formSchema = z.object({
  type: z.enum(["deposit", "withdrawal"]),
  member_id: z.string().min(1, {
    message: "Harap pilih anggota.",
  }),
  product_id: z.string().min(1, {
    message: "Harap pilih jenis simpanan.",
  }),
  amount: z.string().min(1, {
    message: "Harap masukkan nominal.",
  }),
  notes: z.string().optional(),
})

export default function SavingsTransactionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [products, setProducts] = React.useState<any[]>([])

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getSavingsProducts()
        setProducts(data)
      } catch (err) {
        console.error("Failed to load savings products:", err)
      }
    }
    load()
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "deposit",
      member_id: "",
      product_id: "",
      amount: "",
      notes: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    try {
      await addSavingsTransaction({
        member_id: values.member_id,
        product_id: values.product_id,
        type: values.type,
        amount: parseFloat(values.amount),
        notes: values.notes || null,
      })
      
      const typeLabel = values.type === "deposit" ? "Setoran" : "Penarikan"
      toast.success(`${typeLabel} Berhasil`, {
        description: "Transaksi telah dicatat dalam buku kas.",
      })
      
      router.push("/simpanan")
      router.refresh()
    } catch (error: any) {
      toast.error("Transaksi Gagal", {
        description: error.message || "Terjadi kesalahan saat memproses transaksi.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const transactionType = form.watch("type")

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Transaksi Simpanan</h1>
      </div>

      <Card className="border shadow-lg">
        <CardHeader className={cn(
          "transition-colors duration-500",
          transactionType === "deposit" ? "bg-emerald-500/5" : "bg-red-500/5"
        )}>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            {transactionType === "deposit" ? (
              <ArrowUpCircle className="h-6 w-6 text-emerald-600" />
            ) : (
              <ArrowDownCircle className="h-6 w-6 text-red-600" />
            )}
            Form {transactionType === "deposit" ? "Setoran" : "Penarikan"}
          </CardTitle>
          <CardDescription>
            Catat transaksi masuk atau keluar untuk tabungan anggota.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Jenis Transaksi</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="deposit" id="deposit" className="text-emerald-600 border-emerald-500" />
                          </FormControl>
                          <FormLabel htmlFor="deposit" className="font-medium cursor-pointer text-emerald-700">Setoran</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="withdrawal" id="withdrawal" className="text-red-600 border-red-500" />
                          </FormControl>
                          <FormLabel htmlFor="withdrawal" className="font-medium cursor-pointer text-red-700">Penarikan</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6">
                <FormField
                  control={form.control}
                  name="member_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Pilih Anggota</FormLabel>
                      <MemberCombobox 
                        value={field.value} 
                        onValueChange={field.onChange} 
                        disabled={isLoading}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="product_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pilih Produk Simpanan</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih produk">
                                {field.value ? products.find((p) => p.id === field.value)?.name : "Pilih produk"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nominal Transaksi</FormLabel>
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
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keterangan (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Contoh: Setoran awal keanggotaan" 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className={cn(
                    "shadow-md hover:shadow-lg transition-all text-white",
                    transactionType === "deposit" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Simpan Transaksi
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
