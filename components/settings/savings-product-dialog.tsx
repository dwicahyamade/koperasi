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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createSavingsProduct, updateSavingsProduct } from "@/lib/actions/savings"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nama produk minimal 2 karakter.",
  }),
  minimum_amount: z.coerce.number(),
  is_mandatory: z.boolean(),
})

interface SavingsProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: any // If provided, we are in edit mode
  onSuccess: () => void
}

export function SavingsProductDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: SavingsProductDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || "",
      minimum_amount: product?.minimum_amount || 0,
      is_mandatory: product?.is_mandatory ?? false,
    },
  })

  // Update default values when product changes (for edit mode)
  React.useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        minimum_amount: product.minimum_amount || 0,
        is_mandatory: product.is_mandatory,
      })
    } else {
      form.reset({
        name: "",
        minimum_amount: 0,
        is_mandatory: false,
      })
    }
  }, [product, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      if (product?.id) {
        await updateSavingsProduct(product.id, values)
        toast.success("Produk Berhasil Diperbarui")
      } else {
        await createSavingsProduct(values)
        toast.success("Produk Berhasil Ditambahkan")
      }
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error("Gagal Menyimpan Produk", {
        description: error.message || "Terjadi kesalahan pada server.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Produk Simpanan" : "Tambah Produk Simpanan"}</DialogTitle>
          <DialogDescription>
            Atur parameter produk simpanan untuk anggota koperasi.
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
                    <Input placeholder="Simpanan Hari Raya" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="minimum_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setoran Minimum (IDR)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Gunakan 0 jika tidak ada batas minimum.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_mandatory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sifat Simpanan</FormLabel>
                  <Select 
                    onValueChange={(val) => field.onChange(val === "true")} 
                    value={String(field.value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih sifat">
                          {field.value === true ? "Wajib" : "Sukarela"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="false">Sukarela</SelectItem>
                      <SelectItem value="true">Wajib</SelectItem>
                    </SelectContent>
                  </Select>
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
