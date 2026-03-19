"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2, Save } from "lucide-react"
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createLoanProduct, updateLoanProduct } from "@/lib/actions/loans"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nama produk minimal 2 karakter.",
  }),
  interest_rate: z.coerce.number(),
  late_fee: z.coerce.number(),
  max_tenor_months: z.coerce.number(),
})

interface LoanProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: any
  onSuccess: () => void
}

export function LoanProductDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: LoanProductDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || "",
      interest_rate: product?.interest_rate || 0,
      late_fee: product?.late_fee || 0,
      max_tenor_months: product?.max_tenor_months || 12,
    },
  })

  React.useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        interest_rate: product.interest_rate || 0,
        late_fee: product.late_fee || 0,
        max_tenor_months: product.max_tenor_months || 12,
      })
    } else {
      form.reset({
        name: "",
        interest_rate: 0,
        late_fee: 0,
        max_tenor_months: 12,
      })
    }
  }, [product, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      if (product?.id) {
        await updateLoanProduct(product.id, values)
        toast.success("Produk Berhasil Diperbarui")
      } else {
        await createLoanProduct(values)
        toast.success("Produk Berhasil Ditambahkan")
      }
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error("Gagal Menyimpan Produk", {
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Produk Pinjaman" : "Tambah Produk Pinjaman"}</DialogTitle>
          <DialogDescription>
            Atur parameter produk pinjaman untuk anggota koperasi.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Produk</FormLabel>
                  <FormControl>
                    <Input placeholder="Pinjaman Modal Kerja" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="interest_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bunga (%) / Bln</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="max_tenor_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Masa Tenor (Bln)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="late_fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Denda Keterlambatan (%)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Persentase denda dari total tagihan tenor.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Produk
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
