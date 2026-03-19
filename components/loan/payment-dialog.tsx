"use client"

import * as React from "react"
import { toast } from "sonner"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, Loader2 } from "lucide-react"
import { recordInstallmentPayment } from "@/lib/actions/loans"

interface PaymentDialogProps {
  isOpen: boolean
  onClose: () => void
  installment: {
    id: string
    installment_number: number
    principal_amount: number
    interest_amount: number
    due_date: string
  } | null
  memberName: string
}

export function PaymentDialog({ isOpen, onClose, installment, memberName }: PaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  if (!installment) return null

  const totalAmount = Number(installment.principal_amount) + Number(installment.interest_amount)

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val)
  }

  const handleConfirm = async () => {
    setIsSubmitting(true)
    try {
      const result = await recordInstallmentPayment(installment.id, totalAmount)
      if (result.success) {
        toast.success("Pembayaran angsuran berhasil dicatat")
        onClose()
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal mencatat pembayaran")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
          <DialogDescription>
            Silakan periksa detail pembayaran angsuran berikut.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Peminjam</span>
              <span className="font-semibold">{memberName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Angsuran Ke</span>
              <span className="font-semibold">#{installment.installment_number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Jatuh Tempo</span>
              <span className="font-mono">{new Date(installment.due_date).toLocaleDateString('id-ID')}</span>
            </div>
            <hr className="my-2 border-dashed" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pokok</span>
              <span>{formatIDR(Number(installment.principal_amount))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bunga</span>
              <span>{formatIDR(Number(installment.interest_amount))}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total Bayar</span>
              <span className="text-primary">{formatIDR(totalAmount)}</span>
            </div>
          </div>

          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Catatan</AlertTitle>
            <AlertDescription className="text-xs">
              Pastikan uang fisik sudah diterima sebelum menekan tombol konfirmasi. Transaksi ini akan tercatat di Buku Kas secara otomatis.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Konfirmasi Bayar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
