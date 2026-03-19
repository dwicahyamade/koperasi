"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  ChevronLeft, 
  Calculator, 
  Table as TableIcon, 
  ArrowRight,
  RefreshCcw,
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CurrencyInput } from "@/components/currency-input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export default function LoanSimulatorPage() {
  const router = useRouter()
  
  const [amount, setAmount] = React.useState("5000000")
  const [tenor, setTenor] = React.useState("12")
  const [interestRate, setInterestRate] = React.useState("1.5")
  
  const results = React.useMemo(() => {
    const p = parseFloat(amount || "0")
    const t = parseInt(tenor || "0")
    const i = parseFloat(interestRate || "0") / 100
    
    if (!p || !t) return null
    
    const interestPerMonth = p * i
    const principalPerMonth = p / t
    const totalPerMonth = principalPerMonth + interestPerMonth
    
    const schedule = Array.from({ length: t }, (_, idx) => {
      const monthNumber = idx + 1
      const remainingPrincipal = p - (principalPerMonth * monthNumber)
      return {
        month: monthNumber,
        principal: principalPerMonth,
        interest: interestPerMonth,
        total: totalPerMonth,
        remaining: Math.max(0, remainingPrincipal)
      }
    })
    
    return {
      monthly: totalPerMonth,
      totalInterest: interestPerMonth * t,
      totalPayment: totalPerMonth * t,
      schedule
    }
  }, [amount, tenor, interestRate])

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Simulator Pinjaman</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Parameter Pinjaman</CardTitle>
            <CardDescription>Sesuaikan angka untuk melihat simulasi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Nominal Pinjaman</Label>
              <CurrencyInput value={amount} onValueChange={setAmount} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <Label>Tenor (Bulan)</Label>
                 <Select value={tenor} onValueChange={(v) => setTenor(v as string)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                       {[3, 6, 12, 18, 24, 36, 48].map(m => (
                         <SelectItem key={m} value={String(m)}>{m} Bln</SelectItem>
                       ))}
                    </SelectContent>
                 </Select>
               </div>
               <div className="space-y-2">
                 <Label>Bunga (%) / Bln</Label>
                 <Select value={interestRate} onValueChange={(v) => setInterestRate(v as string)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                       {[0.5, 1.0, 1.2, 1.5, 2.0].map(r => (
                         <SelectItem key={r} value={String(r)}>{r}%</SelectItem>
                       ))}
                    </SelectContent>
                 </Select>
               </div>
            </div>

            <Separator />

            <div className="pt-2">
               <Button
                  className="w-full"
                  nativeButton={false}
                  render={<Link href="/pinjaman/pengajuan" />}
               >
                  Mulai Ajukan Pinjaman
                  <ArrowRight className="ml-2 h-4 w-4" />
               </Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
             <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-xs text-muted-foreground font-bold uppercase">Angsuran / Bulan</p>
                <p className="text-xl font-black text-primary">{results ? formatIDR(results.monthly) : "Rp 0"}</p>
             </div>
             <div className="p-4 rounded-xl bg-muted/50 border">
                <p className="text-xs text-muted-foreground font-bold uppercase">Total Bunga</p>
                <p className="text-xl font-bold">{results ? formatIDR(results.totalInterest) : "Rp 0"}</p>
             </div>
             <div className="p-4 rounded-xl bg-muted/50 border">
                <p className="text-xs text-muted-foreground font-bold uppercase">Total Pengembalian</p>
                <p className="text-xl font-bold">{results ? formatIDR(results.totalPayment) : "Rp 0"}</p>
             </div>
          </div>

          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-bold">Jadwal Angsuran (Estimasi)</CardTitle>
              <Badge variant="outline" className="font-mono">Flat Interest</Badge>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-auto rounded-md border">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0">
                    <TableRow>
                      <TableHead className="w-16">Bulan</TableHead>
                      <TableHead>Pokok</TableHead>
                      <TableHead>Bunga</TableHead>
                      <TableHead>Total Tagihan</TableHead>
                      <TableHead className="text-right">Sisa Pokok</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results?.schedule.map((item) => (
                      <TableRow key={item.month}>
                        <TableCell className="font-medium">#{item.month}</TableCell>
                        <TableCell>{formatIDR(item.principal)}</TableCell>
                        <TableCell>{formatIDR(item.interest)}</TableCell>
                        <TableCell className="font-bold">{formatIDR(item.total)}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{formatIDR(item.remaining)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
