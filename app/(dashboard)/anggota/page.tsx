"use client"

import * as React from "react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { Plus, MoreHorizontal, Eye, Edit, Trash } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { cn } from "@/lib/utils"
import { StatusBadge } from "@/components/status-badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Member } from "@/lib/types/database"
import { getMembers } from "@/lib/actions/members"

const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "kta_number",
    header: "KTA",
  },
  {
    accessorKey: "full_name",
    header: "Nama Lengkap",
    cell: ({ row }) => <div className="font-medium">{row.getValue("full_name")}</div>,
  },
  {
    accessorKey: "nik",
    header: "NIK",
  },
  {
    accessorKey: "phone",
    header: "Telepon",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "registered_at",
    header: "Tgl Daftar",
    cell: ({ row }) => {
      const date = row.getValue("registered_at") as string
      return date ? new Date(date).toLocaleDateString('id-ID') : '-'
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const member = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 p-0")}
          >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem
              nativeButton={false}
              render={<Link href={`/anggota/${member.id}`} />}
            >
                <Eye className="mr-2 h-4 w-4" />
                Lihat Detail
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              Edit Data
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export default function MembersPage() {
  const [members, setMembers] = React.useState<Member[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getMembers()
        setMembers(data as Member[])
      } catch (err) {
        console.error("Failed to load members:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Anggota</h1>
          <p className="text-muted-foreground">
            Kelola data seluruh anggota koperasi di sini.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/anggota/tambah" />}
        >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Anggota
        </Button>
      </div>

      <div className="bg-card rounded-lg border shadow-sm p-6">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-muted-foreground animate-pulse">Memuat data anggota...</p>
          </div>
        ) : (
          <DataTable columns={columns} data={members} searchKey="full_name" />
        )}
      </div>
    </div>
  )
}
