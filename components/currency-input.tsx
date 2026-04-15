"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { formatIDR } from "@/lib/utils"

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string | number
  onValueChange: (value: string) => void
}

export function CurrencyInput({
  value,
  onValueChange,
  className,
  ...props
}: CurrencyInputProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const formatValue = (val: string | number) => {
    if (!val) return ""
    const num = typeof val === "number" ? val : parseFloat(val.replace(/\D/g, ""))
    if (isNaN(num)) return ""
    return formatIDR(num)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "")
    onValueChange(rawValue)
  }

  const displayValue = mounted ? formatValue(value) : ""

  return (
    <div className="relative">
      <Input
        {...props}
        className={className}
        value={displayValue}
        onChange={handleChange}
      />
    </div>
  )
}
