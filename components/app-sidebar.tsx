"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Users,
  LayoutDashboard,
  Wallet,
  Landmark,
  BookOpen,
  PieChart,
  Settings,
  LogOut,
  ChevronRight,
  UserCircle,
  Download,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  sidebarMenuButtonVariants,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"

const navMain = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: "Anggota",
    url: "/anggota",
    icon: Users,
    items: [
      { title: "Daftar Anggota", url: "/anggota" },
      { title: "Tambah Anggota", url: "/anggota/tambah" },
    ],
  },
  {
    title: "Simpanan",
    url: "/simpanan",
    icon: Wallet,
    items: [
      { title: "Daftar Simpanan", url: "/simpanan" },
      { title: "Setor/Tarik", url: "/simpanan/setor" },
      { title: "Simpanan Wajib", url: "/simpanan/wajib" },
    ],
  },
  {
    title: "Pinjaman",
    url: "/pinjaman",
    icon: Landmark,
    items: [
      { title: "Daftar Pinjaman", url: "/pinjaman" },
      { title: "Pengajuan", url: "/pinjaman/pengajuan" },
      { title: "Simulasi", url: "/pinjaman/simulasi" },
    ],
  },
  {
    title: "Buku Kas",
    url: "/kas",
    icon: BookOpen,
  },
  {
    title: "Laporan",
    url: "/laporan",
    icon: PieChart,
  },
  {
    title: "Pengaturan",
    url: "/pengaturan",
    icon: Settings,
    items: [
      { title: "User Management", url: "/pengaturan/user" },
      { title: "Produk", url: "/pengaturan/produk" },
      { title: "Audit Logs", url: "/pengaturan/audit" },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter()
  const [user, setUser] = React.useState<{ name: string; email: string }>({
    name: "Loading...",
    email: "",
  })
  const { setOpenMobile } = useSidebar()
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null)
  const [isInstallable, setIsInstallable] = React.useState(false)

  React.useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        // Try to get profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', authUser.id)
          .single()

        setUser({
          name: profile?.full_name || authUser.email?.split('@')[0] || "Admin",
          email: authUser.email || "",
        })
      }
    }
    loadUser()

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()

    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      setIsInstallable(false)
    } else {
      console.log('User dismissed the install prompt')
    }
    setDeferredPrompt(null)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Landmark className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Cingkreman Olas Asih</span>
                <span className="truncate text-xs">Bandem Pegok</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navMain.map((item) => (
            <Collapsible
              key={item.title}
              render={<SidebarMenuItem />}
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              {item.items ? (
                  <>
                  <SidebarMenuButton
                    tooltip={item.title}
                    render={<CollapsibleTrigger />}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              render={<Link href={subItem.url} />}
                              onClick={() => setOpenMobile(false)}
                            >
                              <span>{subItem.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : (
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    tooltip={item.title}
                    onClick={() => setOpenMobile(false)}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                )}
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {isInstallable && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleInstallClick}
                className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-colors"
                size="lg"
              >
                <Download className="mr-2 size-4" />
                <span className="font-semibold">Install Aplikasi (PWA)</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  sidebarMenuButtonVariants({ size: "lg" }),
                  "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                )}
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user.name}
                  </span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronRight className="ml-auto flex size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user.name}</span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserCircle className="mr-2 size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
