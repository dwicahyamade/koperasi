'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats() {
  const supabase = await createClient()

  // 1. Total Members
  const { count: memberCount } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })

  // 2. Total Savings (Aggregate amount)
  const { data: savings } = await supabase
    .from('savings_transactions')
    .select('amount, type')

  const totalSavings = savings?.reduce((acc, curr) => {
    return curr.type === 'deposit' ? acc + Number(curr.amount) : acc - Number(curr.amount)
  }, 0) || 0

  // 3. Total Loans (active/disbursed)
  const { data: activeLoans } = await supabase
    .from('loans')
    .select('principal')
    .eq('status', 'disbursed')

  const totalActiveLoans = activeLoans?.reduce((acc, curr) => acc + Number(curr.principal), 0) || 0

  // 4. Current Cash Balance (from cash_book)
  const { data: cashEntries } = await supabase
    .from('cash_book')
    .select('amount, type')

  const currentCash = cashEntries?.reduce((acc, curr) => {
    return curr.type === 'in' ? acc + Number(curr.amount) : acc - Number(curr.amount)
  }, 0) || 0

  return {
    memberCount: memberCount || 0,
    totalSavings,
    totalActiveLoans,
    currentCash,
  }
}

export async function getCashBookEntries() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('cash_book')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getAuditLogs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}
