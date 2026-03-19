"use client"

import * as React from "react"
import { 
  Plus, 
  Settings2, 
  Wallet, 
  HandCoins,
  Percent,
  Clock,
  MoreVertical,
  Edit2,
  CircleDollarSign
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { getSavingsProducts } from "@/lib/actions/savings"
import { getLoanProducts } from "@/lib/actions/loans"

export default function ProductSettingsPage() {
  const [savingsProducts, setSavingsProducts] = React.useState<any[]>([])
  const [loanProducts, setLoanProducts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const [savings, loans] = await Promise.all([
          getSavingsProducts(),
          getLoanProducts(),
        ])
        setSavingsProducts(savings)
        setLoanProducts(loans)
      } catch (err) {
        console.error("Failed to load products:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Konfigurasi Produk</h1>
          <p className="text-muted-foreground">Atur parameter produk simpanan dan pinjaman koperasi.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      <Tabs defaultValue="savings" className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="savings" className="gap-2">
            <Wallet className="h-4 w-4" />
            Produk Simpanan
          </TabsTrigger>
          <TabsTrigger value="loans" className="gap-2">
            <HandCoins className="h-4 w-4" />
            Produk Pinjaman
          </TabsTrigger>
        </TabsList>

        <TabsContent value="savings" className="m-0 border-0 p-0">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-muted-foreground animate-pulse">Memuat produk...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {savingsProducts.map((p) => (
                <Card key={p.id} className="relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                         <MoreVertical className="h-4 w-4" />
                      </Button>
                   </div>
                   <CardHeader>
                      <CardTitle>{p.name}</CardTitle>
                      <CardDescription>{p.is_mandatory ? 'Wajib' : 'Opsional'}</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                         <CircleDollarSign className="h-4 w-4 text-primary" />
                         <span className="text-2xl font-black">
                           {p.minimum_amount ? formatIDR(Number(p.minimum_amount)) : 'Fleksibel'}
                         </span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                         <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-200">Aktif</Badge>
                         <Button size="sm" variant="ghost">Edit Parameter</Button>
                      </div>
                   </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="loans" className="m-0 border-0 p-0">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <p className="text-muted-foreground animate-pulse">Memuat produk...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
               {loanProducts.map((p) => (
                <Card key={p.id} className="relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                         <MoreVertical className="h-4 w-4" />
                      </Button>
                   </div>
                   <CardHeader>
                      <CardTitle>{p.name}</CardTitle>
                      <CardDescription>Produk Pinjaman</CardDescription>
                   </CardHeader>
                   <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Bunga / Bln</span>
                            <div className="flex items-center gap-1 font-black text-indigo-600">
                               <Percent className="h-3 w-3" />
                               {Number(p.interest_rate)}%
                            </div>
                         </div>
                         <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">Ketentuan</span>
                            <div className="flex items-center gap-1 font-bold">
                               <Clock className="h-3 w-3" />
                               Max {p.max_tenor_months} bln
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                         <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-200">Aktif</Badge>
                         <Button size="sm" variant="ghost">Edit Program</Button>
                      </div>
                   </CardContent>
                </Card>
              ))}
              {loanProducts.length === 0 && (
                <div className="col-span-3 text-center py-10 text-muted-foreground">
                  Belum ada produk pinjaman. Tambahkan produk untuk memulai.
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
