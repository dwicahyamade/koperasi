Frontend Plan — Koperasi Simpan Pinjam (KSP)
Ringkasan
Aplikasi internal KSP dibangun dengan Next.js 16 (App Router) + Tailwind CSS v4 + TypeScript + shadcn/ui + Supabase. Supabase menangani autentikasi (email/password) dan database (PostgreSQL + Row Level Security). Semua komponen UI menggunakan primitif shadcn/ui.

1. Tech Stack & Setup
Dependencies
bash
# shadcn/ui init
npx shadcn@latest init
# shadcn/ui components
npx shadcn@latest add sidebar button card input label select
npx shadcn@latest add table badge tabs dialog alert-dialog
npx shadcn@latest add dropdown-menu breadcrumb separator
npx shadcn@latest add form radio-group progress textarea
npx shadcn@latest add command popover avatar tooltip sonner
npx shadcn@latest add sheet skeleton chart collapsible
# Supabase
npm install @supabase/supabase-js @supabase/ssr
# Others
npm install lucide-react recharts next-themes
npm install @tanstack/react-table
npm install react-hook-form @hookform/resolvers zod
Environment Variables
env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
Struktur Folder
app/
├── (auth)/
│   └── login/page.tsx
├── (dashboard)/
│   ├── layout.tsx              ← SidebarProvider + auth guard
│   ├── page.tsx                ← Dashboard
│   ├── anggota/
│   │   ├── page.tsx            ← DataTable anggota
│   │   ├── tambah/page.tsx
│   │   └── [id]/page.tsx
│   ├── simpanan/
│   │   ├── page.tsx
│   │   ├── setor/page.tsx
│   │   └── wajib/page.tsx
│   ├── pinjaman/
│   │   ├── page.tsx
│   │   ├── pengajuan/page.tsx
│   │   ├── [id]/page.tsx
│   │   └── simulasi/page.tsx
│   ├── kas/page.tsx
│   ├── laporan/
│   │   ├── saldo/page.tsx
│   │   ├── shu/page.tsx
│   │   └── bulanan/page.tsx
│   └── pengaturan/
│       ├── user/page.tsx
│       ├── produk/page.tsx
│       └── audit/page.tsx
lib/
├── supabase/
│   ├── client.ts               ← createBrowserClient
│   ├── server.ts               ← createServerClient (cookies)
│   └── middleware.ts           ← refresh session
├── types/
│   └── database.ts             ← Supabase generated types
└── utils.ts                    ← formatRupiah, etc.
components/
├── ui/                         ← shadcn auto-generated
├── app-sidebar.tsx
├── nav-main.tsx
├── stat-card.tsx
├── data-table.tsx
├── currency-input.tsx
├── member-combobox.tsx
└── status-badge.tsx
middleware.ts                   ← Supabase auth session refresh
2. Supabase — Database Schema
manages
has
has
has
type
type
profiles
uuid
id
PK
text
full_name
text
role
admin | manager
timestamptz
created_at
members
uuid
id
PK
text
kta_number
UK
text
full_name
text
nik
text
phone
text
address
text
status
active | inactive
date
registered_at
timestamptz
created_at
savings_transactions
uuid
id
PK
uuid
member_id
FK
uuid
product_id
FK
text
type
deposit | withdrawal
numeric
amount
text
notes
uuid
created_by
FK
timestamptz
created_at
loans
uuid
id
PK
uuid
member_id
FK
uuid
product_id
FK
numeric
principal
numeric
interest_rate
int
tenor_months
text
status
pending | approved | rejected | disbursed | closed
uuid
approved_by
FK
date
disbursed_at
uuid
created_by
FK
timestamptz
created_at
loan_installments
uuid
id
PK
uuid
loan_id
FK
int
installment_number
date
due_date
numeric
principal_amount
numeric
interest_amount
numeric
paid_amount
date
paid_at
uuid
recorded_by
FK
savings_products
uuid
id
PK
text
name
Pokok | Wajib | Sukarela
numeric
minimum_amount
boolean
is_mandatory
loan_products
uuid
id
PK
text
name
numeric
interest_rate
percent per month
numeric
late_fee
int
max_tenor_months
cash_book
uuid
id
PK
text
type
in | out
text
category
savings_deposit | savings_withdrawal | loan_disbursement | loan_installment | other
numeric
amount
text
description
uuid
reference_id
nullable, FK to source transaction
uuid
created_by
FK
timestamptz
created_at
audit_logs
uuid
id
PK
uuid
user_id
FK
text
action
create | update | delete
text
table_name
uuid
record_id
jsonb
old_data
jsonb
new_data
timestamptz
created_at
Row Level Security (RLS)
Policy	Rule
profiles	User can read own. Manager can read all.
members	All authenticated can SELECT. Admin can INSERT/UPDATE.
savings_transactions	All authenticated can SELECT. Admin can INSERT.
loans	All authenticated can SELECT. Admin can INSERT. Manager can UPDATE (status).
loan_installments	All authenticated can SELECT. Admin can INSERT/UPDATE.
cash_book	All authenticated can SELECT. INSERT via database function only.
audit_logs	Manager can SELECT. INSERT via database trigger only.
3. Supabase — Auth & Data Flow
Authentication
Supabase Auth
Next.js Server
User (Browser)
Supabase Auth
Next.js Server
User (Browser)
middleware.ts refreshes session on every request
RLS applies based on JWT role
POST /login (email, password)
signInWithPassword()
session + JWT
Set cookie + redirect to /
GET /anggota
supabase.from('members').select()
data[]
Render page with data
Data Fetching Pattern
tsx
// Server Component (read) — app/(dashboard)/anggota/page.tsx
const supabase = await createServerClient()
const { data: members } = await supabase
  .from('members')
  .select('*')
  .order('created_at', { ascending: false })
// Server Action (write) — app/(dashboard)/simpanan/setor/actions.ts
'use server'
export async function createDeposit(formData: FormData) {
  const supabase = await createServerClient()
  // Insert savings_transaction → auto triggers cash_book entry
}
4. Arsitektur Navigasi
Sitemap
Sidebar Menu
🔐 Login
📊 Dashboard
👥 Anggota
💰 Simpanan
🏦 Pinjaman
📒 Kas
📈 Laporan
⚙️ Pengaturan
Daftar
Tambah
Detail
Daftar
Setor/Tarik
Auto Wajib
Daftar
Pengajuan
Kartu Piutang
Simulasi
Buku Kas
Saldo
SHU
Bulanan
User
Produk
Audit
Route → Akses
Route	Akses
/login	Public
/	Admin, Manager
/anggota, /simpanan, /pinjaman, /kas	Admin, Manager
/anggota/tambah, /simpanan/setor, /pinjaman/pengajuan	Admin
/laporan/*, /pengaturan/*	Manager
5. Layout & Wireframe
Authenticated Layout (shadcn Sidebar)
┌────────────┬─────────────────────────────────────────────┐
│ <Sidebar>  │ <Breadcrumb>              🔔 <Avatar> ▼    │
│ ┌──────┐   │─────────────────────────────────────────────│
│ │ LOGO │   │                                             │
│ └──────┘   │  <Card>  <Card>  <Card>  <Card>            │
│            │  Anggota  Simpan  Kas     Pinjam            │
│ 📊 Dash.  │  156      1.2M    800K    23                │
│ 👥 Anggota│                                             │
│ 💰 Simpan │  <Card>                                     │
│ 🏦 Pinjam │   <Table> Transaksi Terbaru                 │
│ 📒 Kas    │   / <Chart> Arus Kas                        │
│ 📈 Laporan│                                             │
│ ⚙️ Setting│                                             │
│            │                                             │
│ ──────── │                                             │
│ 👤 Admin  │                                             │
│ 🚪 Logout │                                             │
└────────────┴─────────────────────────────────────────────┘
Wireframe Halaman Utama
A. Login — Card + Form + Input + Button
┌─────────────────────────────────────┐
│         (gradient background)       │
│                                     │
│       <Card w-400>                  │
│         🏛️ LOGO KSP                 │
│         <Input> Email               │
│         <Input> Password            │
│         <Button> Masuk              │
│       </Card>                       │
└─────────────────────────────────────┘
B. Daftar Anggota — DataTable + Badge + DropdownMenu
┌─ Content ──────────────────────────────────────┐
│ <h2> Manajemen Anggota    <Button> + Tambah    │
│ <Input> Cari...          <Select> Status ▼     │
│                                                │
│ <DataTable>                                    │
│ │No│ KTA    │ Nama    │ Status      │ Aksi    ││
│ │1 │KTA-001 │Budi S.  │<Badge>Aktif │<Menu>👁 ││
│ │2 │KTA-002 │Siti N.  │<Badge>Aktif │     ✏️ ││
│ </DataTable>                                   │
│ <Pagination>                                   │
└────────────────────────────────────────────────┘
C. Detail Anggota — Card + Tabs + Table
┌─ Content ──────────────────────────────────────┐
│ ◀ Kembali                                      │
│ <Card> 👤 Budi Santoso  <Badge>Aktif           │
│   KTA-001 │ NIK │ Telp │ Alamat │ Tgl Daftar  │
│ </Card>                                        │
│ <Tabs> [Simpanan] [Pinjaman] [Riwayat]         │
│   <TabsContent>                                │
│     Pokok: 500K │ Wajib: 1.2M │ Sukarela: 3.5M│
│     Total: 5.2M                                │
│     <Table> riwayat setoran </Table>            │
│   </TabsContent>                               │
│ </Tabs>                                        │
└────────────────────────────────────────────────┘
D. Form Simpanan — Form + RadioGroup + Command/Popover + CurrencyInput
┌─ Content ──────────────────────────────────────┐
│ <h2> Transaksi Simpanan                        │
│ <Card>                                         │
│   <RadioGroup> ◉ Setoran  ○ Penarikan          │
│   <Popover+Command> 🔍 Cari anggota...         │
│   <Select> Pokok | Wajib | Sukarela            │
│   <CurrencyInput> Rp 500.000                   │
│   <Textarea> Keterangan                        │
│   <Button> Batal   <Button> 💾 Simpan          │
│ </Card>                                        │
└────────────────────────────────────────────────┘
E. Daftar Pinjaman — Tabs (filter) + DataTable + Badge
┌─ Content ──────────────────────────────────────┐
│ <h2> Manajemen Pinjaman  <Button> + Ajukan     │
│ <Tabs> [Semua][Pending🟡][Approved🔵][Cair🟢][Lunas⚪]│
│ <DataTable>                                    │
│ │No│ Anggota │ Nominal  │Tenor│ Status    │Aksi││
│ │1 │ Budi S. │ 10.000K  │12bl │<Badge>Pend│ 👁 ││
│ │2 │ Siti N. │  5.000K  │ 6bl │<Badge>Cair│ 👁 ││
│ </DataTable>                                   │
└────────────────────────────────────────────────┘
F. Kartu Piutang — Card + Progress + Table + AlertDialog
┌─ Content ──────────────────────────────────────┐
│ ◀ Kembali                                      │
│ <Card> Siti N. │ Rp 5jt │ 1.5%/bln │ 🟢Cair   │
│ <Progress value={67}/> 4/6 angsuran             │
│ <Card>                                         │
│ <Table>                                        │
│ │Ke│ Tgl Bayar │ Pokok  │ Bunga │ Total  │ ✓  ││
│ │1 │ 2026-02-15│ 833K   │ 75K   │ 908K   │ ✅ ││
│ │5 │ 2026-06-15│ 833K   │ 75K   │ 908K   │ ⬜ ││
│ </Table>                                       │
│ </Card>                                        │
│ Sisa Pokok: Rp 1.666K                          │
│ <AlertDialog trigger={<Button>📝 Catat}/>      │
└────────────────────────────────────────────────┘
G. Kalkulator Simulasi — Card + Input + Separator
┌─ Content ──────────────────────────────────────┐
│ <h2> Kalkulator Simulasi                       │
│ <grid cols-2>                                  │
│  <Card> INPUT                                  │
│    Nominal: <Input> Rp 10.000.000              │
│    Bunga:   <Input> 1.5                        │
│    Tenor:   <Input> 12                         │
│    <Button> 🧮 Hitung                          │
│  </Card>                                       │
│  <Card> HASIL                                  │
│    Angsuran/bln: Rp 908.333                    │
│    <Separator/>                                │
│    Total Bayar: Rp 10.900.000                  │
│    Total Bunga: Rp    900.000                  │
│  </Card>                                       │
│ </grid>                                        │
└────────────────────────────────────────────────┘
6. Status Flow Pinjaman
Admin input
Manager approve
Manager reject
Dana cair
Lunas
Pending
Approved
Rejected
Disbursed
Closed
7. User Flow Operasional
Admin
Manager
Approve
Ya
Tidak
🔐 Login via Supabase Auth
Role?
Dashboard Admin
Dashboard Manager
Daftarkan Anggota
Input Simpanan → Kas Masuk
Input Pinjaman → Status: Pending
Catat Angsuran → Update Kartu Piutang
Approve/Reject Pinjaman
Cairkan → Kas Keluar
Lihat Laporan: Saldo / SHU / Kas
Lunas?
Status: Closed
Lanjut angsuran
8. Komponen Kustom → shadcn/ui
Komponen	Basis shadcn	Deskripsi
AppSidebar	Sidebar + Collapsible	Navigasi, auto-responsive
TopBar	Breadcrumb + DropdownMenu + Avatar	Header
StatCard	Card	Angka ringkasan dashboard
DataTable	Table + @tanstack/react-table	Search, sort, pagination
StatusBadge	Badge	Warna per status pinjaman
MemberCombobox	Command + Popover	Searchable pilih anggota
CurrencyInput	Input	Auto-format Rupiah
ConfirmAction	AlertDialog	Konfirmasi aksi kritis
LoanCalculator	Card + Input + Separator	Simulasi pinjaman
LoanProgress	Progress	Visualisasi angsuran
9. RBAC Navigation
👔 Ketua / Manajer
Dashboard ✅
Anggota View ✅
Simpanan View ✅
Pinjaman Approve ✅
Kas ✅
Laporan ✅
Pengaturan ✅
🧑‍💼 Staf Admin
Dashboard ✅
Anggota CRUD ✅
Simpanan Input ✅
Pinjaman Input/Catat ✅
Kas Lihat ✅
Laporan ❌
Pengaturan ❌
Role disimpan di tabel profiles.role dan dibaca dari JWT via Supabase Auth. Sidebar items di-filter berdasarkan role.