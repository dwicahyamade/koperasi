"use client"

import * as React from "react"
import { 
  Plus, 
  Settings2, 
  Wallet, 
  HandCoins,
  Percent,
  Clock,
  CircleDollarSign,
  Trash2,
  MoreVertical,
  Edit2,
} from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn, formatIDR } from "@/lib/utils"
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { getSavingsProducts } from "@/lib/actions/savings"
import { SavingsProductDialog } from "@/components/savings/savings-product-dialog"
import { DeleteProductDialog } from "@/components/settings/delete-product-dialog"

export default function ProductSettingsPage() {
  const [savingsProducts, setSavingsProducts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  
  // Dialog states
  const [savingsDialogOpen, setSavingsDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  
  // Selected product states
  const [selectedProduct, setSelectedProduct] = React.useState<any>(null)

  const load = React.useCallback(async () => {
    setLoading(true)
    try {
      const savings = await getSavingsProducts()
      setSavingsProducts(savings)
    } catch (err) {
      console.error("Failed to load products:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Konfigurasi Produk</h1>
          <p className="text-muted-foreground">Atur parameter produk simpanan koperasi.</p>
        </div>
        <Button onClick={() => {
          setSelectedProduct(null)
          setSavingsDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Wallet className="h-4 w-4" />
          <h2 className="font-bold">Produk Simpanan</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-muted-foreground animate-pulse">Memuat produk...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {savingsProducts.map((p) => (
              <Card key={p.id} className="relative overflow-hidden group">
                  <CardHeader>
                    <CardTitle>{p.name}</CardTitle>
                    <CardDescription>{p.is_mandatory ? 'Wajib' : 'Sukarela'}</CardDescription>
                  </CardHeader>
                  <div className="absolute top-0 right-0 p-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedProduct(p)
                          setSavingsDialogOpen(true)
                        }}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit Parameter
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setSelectedProduct(p)
                            setDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus Produk
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                        <CircleDollarSign className="h-4 w-4 text-primary" />
                        <span className="text-2xl font-black">
                          {p.minimum_amount ? formatIDR(Number(p.minimum_amount)) : 'Fleksibel'}
                        </span>
                    </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-200 uppercase text-[10px]">Aktif</Badge>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-xs h-8"
                          onClick={() => {
                            setSelectedProduct(p)
                            setSavingsDialogOpen(true)
                          }}
                        >
                          Edit Parameter
                        </Button>
                      </div>
                  </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <SavingsProductDialog
        open={savingsDialogOpen}
        onOpenChange={setSavingsDialogOpen}
        product={selectedProduct}
        onSuccess={load}
      />

      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        product={selectedProduct}
        type="savings"
        onSuccess={load}
      />
    </div>
  )
}
