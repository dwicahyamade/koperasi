"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  ChevronLeft, 
  User, 
  MapPin, 
  Phone, 
  CreditCard, 
  History, 
  TrendingUp,
  Download,
  Calendar,
  Edit, 
  Landmark, 
  Wallet
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
import { StatusBadge } from "@/components/status-badge"
import { StatCard } from "@/components/stat-card"
import { getMemberDetail } from "@/lib/actions/members"
import { Member } from "@/lib/types/database"

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const router = useRouter()
  const [member, setMember] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getMemberDetail(id)
        setMember(data)
      } catch (err) {
        console.error("Failed to load member:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted-foreground">Memuat data anggota...</div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Anggota tidak ditemukan.</p>
        <Button variant="outline" onClick={() => router.back()}>Kembali</Button>
      </div>
    )
  }

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val)
  }

  // Calculate savings totals from real data
  const savingsTotal = member.savings?.reduce((acc: number, tx: any) => {
    return tx.type === 'deposit' ? acc + Number(tx.amount) : acc - Number(tx.amount)
  }, 0) || 0

  // Calculate active loans total
  const activeLoansTotal = member.loans
    ?.filter((l: any) => l.status === 'disbursed')
    .reduce((acc: number, l: any) => acc + Number(l.principal), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{member.full_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-muted-foreground font-mono">{member.kta_number}</span>
            <StatusBadge status={member.status} />
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Cetak KTA
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Informasi Anggota</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">NIK</p>
                <p className="text-sm font-medium">{member.nik}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Telepon</p>
                <p className="text-sm font-medium">{member.phone || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Alamat</p>
                <p className="text-sm font-medium">{member.address || '-'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Bergabung Sejak</p>
                <p className="text-sm font-medium">{member.registered_at}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats and Tabs */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              title="Total Simpanan"
              value={formatIDR(savingsTotal)}
              icon={Wallet}
              className="bg-primary/5 border-primary/20 shadow-none text-primary"
            />
            <StatCard
              title="Pinjaman Berjalan"
              value={formatIDR(activeLoansTotal)}
              icon={Landmark}
              className="shadow-none"
            />
            <StatCard
              title="Jumlah Pinjaman"
              value={`${member.loans?.length || 0}`}
              icon={TrendingUp}
              className="shadow-none"
            />
          </div>

          <Tabs defaultValue="simpanan" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1">
              <TabsTrigger value="simpanan">Simpanan</TabsTrigger>
              <TabsTrigger value="pinjaman">Pinjaman</TabsTrigger>
              <TabsTrigger value="riwayat">Riwayat Transaksi</TabsTrigger>
            </TabsList>
            
            <Card className="mt-4 border-t-0 rounded-t-none">
              <TabsContent value="simpanan" className="p-6 m-0">
                <div className="space-y-4">
                  {member.savings && member.savings.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Riwayat Simpanan</h4>
                      {member.savings.map((tx: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-sm p-3 bg-muted/20 rounded-lg">
                           <div className="flex flex-col">
                              <span className="font-medium">
                                {tx.type === 'deposit' ? 'Setoran' : 'Penarikan'} {tx.savings_products?.name || ''}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono">
                                {new Date(tx.created_at).toLocaleDateString('id-ID')}
                              </span>
                           </div>
                           <span className={tx.type === 'deposit' ? "font-bold text-emerald-600" : "font-bold text-red-600"}>
                             {tx.type === 'deposit' ? '+' : '-'}{formatIDR(Number(tx.amount))}
                           </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Belum ada data simpanan.
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="pinjaman" className="p-6 m-0">
                {member.loans && member.loans.length > 0 ? (
                  <div className="space-y-3">
                    {member.loans.map((loan: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-sm p-3 bg-muted/20 rounded-lg">
                        <div className="flex flex-col">
                          <span className="font-medium">{loan.loan_products?.name || 'Pinjaman'}</span>
                          <span className="text-xs text-muted-foreground">
                            {loan.tenor_months} bulan • {loan.interest_rate}%/bln
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold">{formatIDR(Number(loan.principal))}</span>
                          <StatusBadge status={loan.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                     <div className="p-4 rounded-full bg-muted/50">
                        <History className="h-8 w-8 text-muted-foreground" />
                     </div>
                     <div>
                        <h3 className="font-semibold text-lg">Tidak Ada Pinjaman</h3>
                        <p className="text-sm text-muted-foreground max-w-[250px]">Anggota ini tidak memiliki riwayat pinjaman.</p>
                     </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="riwayat" className="p-0 m-0">
                <div className="text-center py-10 text-muted-foreground">
                   Belum ada data riwayat aktivitas lengkap.
                </div>
              </TabsContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
