"use client"

import * as React from "react"
import { 
  UserPlus, 
  ShieldCheck, 
  MoreHorizontal,
  Trash2,
  Edit
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

export default function UserManagementPage() {
  const [users, setUsers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      const supabase = createClient()
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setUsers(data || [])
      } catch (err) {
        console.error("Failed to load users:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const columns = [
    {
      accessorKey: "full_name",
      header: "User",
      cell: ({ row }: { row: any }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{(user.full_name || 'U').charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-bold text-sm">{user.full_name || 'Unnamed'}</span>
              <span className="text-xs text-muted-foreground font-mono">{user.id.slice(0, 8)}...</span>
            </div>
          </div>
        )
      }
    },
    { 
      accessorKey: "role", 
      header: "Role",
      cell: ({ row }: { row: any }) => <span className="capitalize font-medium text-xs bg-muted px-2 py-0.5 rounded-full">{row.getValue("role")}</span>
    },
    {
      id: "actions",
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8 p-0")}
          >
              <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Manajemen User</DropdownMenuLabel>
            <DropdownMenuItem>
               <Edit className="mr-2 h-4 w-4" />
               Edit Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
               <ShieldCheck className="mr-2 h-4 w-4" />
               Ubah Hak Akses
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
               <Trash2 className="mr-2 h-4 w-4" />
               Nonaktifkan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen User</h1>
          <p className="text-muted-foreground">Kelola pengguna sistem dan hak akses (RBAC).</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Tambah User
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-md">
           <CardHeader>
              <CardTitle>Daftar Pengguna</CardTitle>
              <CardDescription>Seluruh staf yang memiliki akses ke dashboard aplikasi.</CardDescription>
           </CardHeader>
           <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <p className="text-muted-foreground animate-pulse">Memuat data user...</p>
                </div>
              ) : (
                <DataTable columns={columns} data={users} searchKey="full_name" />
              )}
           </CardContent>
        </Card>
      </div>
    </div>
  )
}
