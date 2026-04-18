"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { usePathname } from "next/navigation"
import React from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Clean up path segments and format them
  const segments = pathname
    .split('/')
    .filter(segment => segment !== '')
    .map(segment => {
      return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    })

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex flex-1 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                
                {segments.length === 0 ? (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Overview</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                ) : (
                  segments.map((segment, index) => {
                    const isLast = index === segments.length - 1
                    
                    return (
                      <React.Fragment key={segment}>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem>
                          {isLast ? (
                            <BreadcrumbPage>{segment}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbPage className="text-muted-foreground">{segment}</BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                      </React.Fragment>
                    )
                  })
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0 w-full min-w-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-4 w-full min-w-0">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
