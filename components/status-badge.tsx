import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatusType = 
  | "pending" 
  | "approved" 
  | "rejected" 
  | "disbursed" 
  | "closed" 
  | "active" 
  | "inactive"
  | "deposit"
  | "withdrawal"

interface StatusBadgeProps {
  status: StatusType | string
  className?: string
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }> = {
  pending: { label: "Menunggu", variant: "warning" },
  approved: { label: "Disetujui", variant: "info" },
  rejected: { label: "Ditolak", variant: "destructive" },
  disbursed: { label: "Cair", variant: "success" },
  closed: { label: "Selesai", variant: "secondary" },
  active: { label: "Aktif", variant: "success" },
  inactive: { label: "Non-Aktif", variant: "destructive" },
  deposit: { label: "Setoran", variant: "success" },
  withdrawal: { label: "Penarikan", variant: "destructive" },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusMap[status.toLowerCase()] || { label: status, variant: "outline" }
  
  // Note: shadcn badge variants might need custom styles for success/warning/info if not defined
  return (
    <Badge 
      variant={config.variant as any} 
      className={cn(
        "capitalize font-medium",
        config.variant === "success" && "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20",
        config.variant === "warning" && "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-500/20",
        config.variant === "info" && "bg-sky-500/15 text-sky-700 hover:bg-sky-500/25 border-sky-500/20",
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
