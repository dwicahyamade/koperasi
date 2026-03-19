"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ChevronLeft, Loader2, Save } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createMember } from "@/lib/actions/members"

const formSchema = z.object({
  full_name: z.string().min(2, {
    message: "Nama lengkap minimal 2 karakter.",
  }),
  nik: z.string().min(16, {
    message: "NIK harus 16 digit.",
  }).max(16, {
    message: "NIK harus 16 digit.",
  }),
  phone: z.string().min(10, {
    message: "Nomor telepon minimal 10 digit.",
  }),
  address: z.string().min(5, {
    message: "Alamat minimal 5 karakter.",
  }),
  status: z.enum(["active", "inactive"]),
})

export default function AddMemberPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      nik: "",
      phone: "",
      address: "",
      status: "active",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    
    try {
      // Generate KTA number based on timestamp
      const ktaNumber = `KTA-${String(Date.now()).slice(-6)}`
      
      await createMember({
        kta_number: ktaNumber,
        full_name: values.full_name,
        nik: values.nik,
        phone: values.phone,
        address: values.address,
        status: values.status,
      })
      
      toast.success("Anggota Berhasil Ditambahkan", {
        description: `${values.full_name} telah resmi menjadi anggota.`,
      })
      
      router.push("/anggota")
      router.refresh()
    } catch (error: any) {
      toast.error("Gagal Menambahkan Anggota", {
        description: error.message || "Terjadi kesalahan saat menyimpan data.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Tambah Anggota Baru</h1>
      </div>

      <Card className="border shadow-lg">
        <CardHeader>
          <CardTitle>Informasi Pribadi</CardTitle>
          <CardDescription>
            Lengkapi data diri calon anggota koperasi dengan benar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Budi Santoso" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nik"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIK (Nomor Induk Kependudukan)</FormLabel>
                      <FormControl>
                        <Input placeholder="16 digit NIK" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Telepon</FormLabel>
                      <FormControl>
                        <Input placeholder="08xxxxxxxxxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alamat Lengkap</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Jl. Merdeka No. 1, Desa Makmur, Kec. Sentosa" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Keanggotaan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status">
                            {field.value === "active" ? "Aktif" : field.value === "inactive" ? "Tidak Aktif" : "Pilih status"}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="inactive">Non-Aktif</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Anggota aktif dapat melakukan simpanan dan pinjaman.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-primary shadow-md hover:shadow-lg transition-all">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Simpan Anggota
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
