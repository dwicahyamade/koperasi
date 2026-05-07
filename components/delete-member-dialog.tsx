"use client"

import * as React from "react"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { deleteMember } from "@/lib/actions/members"

interface DeleteMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: any
  onSuccess: () => void
}

export function DeleteMemberDialog({
  open,
  onOpenChange,
  member,
  onSuccess,
}: DeleteMemberDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false)

  async function onDelete() {
    if (!member?.id) return
    setIsLoading(true)
    try {
      await deleteMember(member.id)
      toast.success("Anggota Berhasil Dihapus", {
        description: `Data anggota ${member.full_name} telah dihapus dari sistem.`,
      })
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error("Gagal Menghapus Anggota", {
        description: error.message || "Terjadi kesalahan saat menghapus anggota.",
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
            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus data anggota{" "}
            <span className="font-bold text-foreground">{member?.full_name}</span>{" "}
            (KTA: <span className="font-mono font-bold text-foreground">{member?.kta_number}</span>) secara permanen dari sistem.
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
                Hapus Anggota
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
