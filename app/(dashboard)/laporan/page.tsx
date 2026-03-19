"use client"

import * as React from "react"
import { 
  FileText, 
  Table as TableIcon, 
  ArrowRight,
  TrendingUp,
  CreditCard,
  PieChart as PieChartIcon,
  Download,
  Calendar
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const reportTypes = [
  {
    title: "Neraca Keuangan",
    description: "Laporan posisi keuangan (Aset, Liabilitas, Ekuitas).",
    icon: TableIcon,
    category: "Financial",
    status: "Ready"
  },
  {
    title: "Laba Rugi (SHU)",
    description: "Rincian pendapatan dan beban operasional.",
    icon: TrendingUp,
    category: "Financial",
    status: "Ready"
  },
  {
    title: "Saldo Simpanan",
    description: "Rekapitulasi seluruh tabungan anggota per kategori.",
    icon: CreditCard,
    category: "Savings",
    status: "Ready"
  },
  {
    title: "Kolektibilitas Pinjaman",
    description: "Analisis kelancaran pembayaran angsuran.",
    icon: PieChartIcon,
    category: "Loans",
    status: "Ready"
  },
  {
    title: "Arus Kas (Cash Flow)",
    description: "Rekap mingguan/bulanan aliran dana.",
    icon: FileText,
    category: "Treasury",
    status: "Ready"
  }
]

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan & Analitik</h1>
          <p className="text-muted-foreground">Unduh dokumen resmi dan analisis data keuangan koperasi.</p>
        </div>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Periode: Semester 1 2024
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <Card key={report.title} className="group hover:border-primary/50 transition-all duration-300 shadow-md hover:shadow-lg">
            <CardHeader className="pb-4">
               <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                     <report.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-widest">{report.category}</Badge>
               </div>
               <CardTitle className="text-xl group-hover:text-primary transition-colors">{report.title}</CardTitle>
               <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="flex items-center gap-4 pt-4 mt-auto border-t">
                  <Button variant="ghost" size="sm" className="px-0 hover:bg-transparent text-primary">
                    Lihat Preview
                  </Button>
                  <Button size="sm" className="ml-auto">
                    <Download className="mr-2 h-4 w-4" />
                    Export PDF
                  </Button>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed border-2 bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center py-10 text-center gap-3">
           <div className="p-4 rounded-full bg-white/50 border shadow-sm">
              <TrendingUp className="h-8 w-8 text-primary opacity-50" />
           </div>
           <div>
              <h3 className="font-bold text-lg">Butuh Laporan Kustom?</h3>
              <p className="text-sm text-muted-foreground max-w-[400px]">
                Gunakan fitur Advanced Query untuk membuat laporan spesifik berdasarkan parameter tertentu (SQL-based).
              </p>
           </div>
           <Button variant="outline" className="mt-2">Buka Advanced Query</Button>
        </CardContent>
      </Card>
    </div>
  )
}
