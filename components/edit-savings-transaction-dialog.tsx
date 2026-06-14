"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Save, Trash2, ArrowUpCircle, ArrowDownCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CurrencyInput } from "@/components/currency-input"
import { DatePicker } from "@/components/ui/date-picker"
import { cn, formatIDR } from "@/lib/utils"
import { updateSavingsTransaction, deleteSavingsTransaction, getSavingsProducts } from "@/lib/actions/savings"

const formSchema = z.object({
  type: z.enum(["deposit", "withdrawal"]),
  product_id: z.string().min(1, {
    message: "Harap pilih jenis simpanan.",
  }),
  amount: z.string().min(1, {
    message: "Harap masukkan nominal.",
  }),
  notes: z.string().optional().nullable(),
  date: z.string().min(1, {
    message: "Harap pilih tanggal.",
  }),
})

const getTodayDateString = () => {
  const date = new Date()
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().split('T')[0]
}

interface EditSavingsTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: {
    id: string
    type: "deposit" | "withdrawal"
    amount: number
    product_id: string
    created_at?: string
    notes?: string | null
    savings_products?: {
      name: string
    }
  } | null | undefined
  onSuccess: () => void
}

export function EditSavingsTransactionDialog({
  open,
  onOpenChange,
  transaction,
  onSuccess,
}: EditSavingsTransactionDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [products, setProducts] = React.useState<{ id: string; name: string }[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getSavingsProducts()
        setProducts(data)
      } catch (err) {
        console.error("Failed to load savings products:", err)
      }
    }
    if (open) {
      load()
    }
  }, [open])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "deposit",
      product_id: "",
      amount: "",
      notes: "",
      date: getTodayDateString(),
    },
  })

  React.useEffect(() => {
    if (transaction) {
      form.reset({
        type: transaction.type,
        product_id: transaction.product_id,
        amount: String(transaction.amount),
        notes: transaction.notes || "",
        date: transaction.created_at ? transaction.created_at.split('T')[0] : getTodayDateString(),
      })
      setShowDeleteConfirm(false)
    }
  }, [transaction, form, open])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!transaction?.id) return
    setIsLoading(true)
    
    try {
      await updateSavingsTransaction(transaction.id, {
        product_id: values.product_id,
        type: values.type,
        amount: parseFloat(values.amount),
        notes: values.notes || null,
        date: values.date,
      })
      
      const typeLabel = values.type === "deposit" ? "Setoran" : "Penarikan"
      toast.success(`Transaksi Berhasil Diubah`, {
        description: `${typeLabel} telah diperbarui dan disinkronkan ke buku kas.`,
      })
      
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error("Gagal Mengubah Transaksi", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan perubahan.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onDelete() {
    if (!transaction?.id) return
    setIsLoading(true)
    
    try {
      await deleteSavingsTransaction(transaction.id)
      toast.success("Transaksi Berhasil Dihapus", {
        description: "Catatan transaksi telah dihapus dari sistem dan disinkronkan ke buku kas.",
      })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error("Gagal Menghapus Transaksi", {
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus transaksi.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const transactionType = form.watch("type")

  if (showDeleteConfirm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Hapus Transaksi Simpanan?
            </DialogTitle>
            <DialogDescription className="pt-2">
              Apakah Anda yakin ingin menghapus transaksi{" "}
              <span className="font-bold text-foreground">
                {transaction?.type === "deposit" ? "Setoran" : "Penarikan"}{" "}
                {transaction?.savings_products?.name || ""}
              </span>{" "}
              sebesar{" "}
              <span className="font-bold text-foreground font-mono">
                {formatIDR(Number(transaction?.amount))}
              </span>{" "}
              pada tanggal{" "}
              <span className="font-bold text-foreground font-mono">
                {transaction?.created_at ? new Date(transaction.created_at).toLocaleDateString('id-ID') : ""}
              </span>?
              <br /><br />
              Tindakan ini tidak dapat dibatalkan dan akan langsung mempengaruhi total saldo anggota serta saldo kas koperasi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Ya, Hapus
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className={cn(
          "p-4 -mx-4 -mt-4 rounded-t-xl transition-colors duration-500",
          transactionType === "deposit" ? "bg-emerald-500/5" : "bg-red-500/5"
        )}>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            {transactionType === "deposit" ? (
              <ArrowUpCircle className="h-5 w-5 text-emerald-600" />
            ) : (
              <ArrowDownCircle className="h-5 w-5 text-red-600" />
            )}
            Edit Transaksi Simpanan
          </DialogTitle>
          <DialogDescription>
            Ubah rincian transaksi tabungan anggota ini.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Jenis Transaksi</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                      disabled={isLoading}
                    >
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="deposit" id="dialog-deposit" className="text-emerald-600 border-emerald-500" />
                        </FormControl>
                        <FormLabel htmlFor="dialog-deposit" className="font-medium cursor-pointer text-emerald-700">Setoran</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="withdrawal" id="dialog-withdrawal" className="text-red-600 border-red-500" />
                        </FormControl>
                        <FormLabel htmlFor="dialog-withdrawal" className="font-medium cursor-pointer text-red-700">Penarikan</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tanggal</FormLabel>
                    <FormControl>
                      <DatePicker 
                        value={field.value ? new Date(field.value) : undefined} 
                        onChange={(date) => {
                          if (date) {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, '0');
                            const day = String(date.getDate()).padStart(2, '0');
                            field.onChange(`${year}-${month}-${day}`);
                          }
                        }}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Produk Simpanan</FormLabel>
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
            </div>

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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Keterangan transaksi" 
                      className="min-h-[60px]"
                      value={field.value || ""}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6 flex flex-row justify-between items-center sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-0 h-10 w-10 flex items-center justify-center rounded-md"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                title="Hapus Transaksi"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)} 
                  disabled={isLoading}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className={cn(
                    "shadow-md text-white",
                    transactionType === "deposit" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Simpan
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
