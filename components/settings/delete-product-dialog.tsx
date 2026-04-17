"use client"

import * as React from "react"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { deleteSavingsProduct } from "@/lib/actions/savings"

interface DeleteProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: any
  type: "savings"
  onSuccess: () => void
}

export function DeleteProductDialog({
  open,
  onOpenChange,
  product,
  type,
  onSuccess,
}: DeleteProductDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  async function onDelete() {
    setIsLoading(true)
    try {
      await deleteSavingsProduct(product.id)
      toast.success("Produk Berhasil Dihapus")
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error("Gagal Menghapus Produk", {
        description: error.message || "Pastikan produk tidak sedang digunakan oleh anggota.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus produk{" "}
            <span className="font-bold text-foreground">{product?.name}</span> secara permanen dari sistem.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
          <Button
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
                Hapus Produk
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
