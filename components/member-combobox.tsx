"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { createClient } from "@/lib/supabase/client"

interface MemberOption {
  id: string
  label: string
}

interface MemberComboboxProps {
  value?: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

export function MemberCombobox({ value, onValueChange, disabled }: MemberComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [members, setMembers] = React.useState<MemberOption[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadMembers() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('members')
        .select('id, full_name, kta_number')
        .eq('status', 'active')
        .order('full_name')

      if (!error && data) {
        setMembers(data.map(m => ({
          id: m.id,
          label: `${m.full_name} (${m.kta_number})`
        })))
      }
      setLoading(false)
    }
    loadMembers()
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || loading}
          />
        }
      >
        {loading 
          ? "Memuat anggota..."
          : value
            ? members.find((m) => m.id === value)?.label
            : "Cari anggota..."
        }
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Nama atau KTA..." />
          <CommandList>
            <CommandEmpty>Anggota tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {members.map((m) => (
                <CommandItem
                  key={m.id}
                  value={m.label}
                  onSelect={() => {
                    onValueChange(m.id === value ? "" : m.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === m.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {m.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
