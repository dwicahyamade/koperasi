'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export const getDashboardStats = cache(async (startDate?: string, endDate?: string) => {
  const supabase = await createClient()

  // 1. Member Query
  const memberQuery = supabase
    .from('members')
    .select('*', { count: 'exact', head: true })

  // 2. Savings Query
  let savingsQuery = supabase
    .from('savings_transactions')
    .select('amount, type, savings_products(name)')

  if (startDate) {
    savingsQuery = savingsQuery.gte('created_at', startDate)
  }
  if (endDate) {
    const nextDay = new Date(endDate)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayStr = nextDay.toISOString().split('T')[0]
    savingsQuery = savingsQuery.lt('created_at', nextDayStr)
  }

  // 3. Loans Query
  let loansQuery = supabase
    .from('loans')
    .select('principal')
    .eq('status', 'disbursed')

  if (startDate) {
    loansQuery = loansQuery.gte('created_at', startDate)
  }
  if (endDate) {
    const nextDay = new Date(endDate)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayStr = nextDay.toISOString().split('T')[0]
    loansQuery = loansQuery.lt('created_at', nextDayStr)
  }

  // 4. Cash Query
  let cashQuery = supabase
    .from('cash_book')
    .select('amount, type')

  if (startDate) {
    cashQuery = cashQuery.gte('created_at', startDate)
  }
  if (endDate) {
    const nextDay = new Date(endDate)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayStr = nextDay.toISOString().split('T')[0]
    cashQuery = cashQuery.lt('created_at', nextDayStr)
  }

  // Execute all queries in parallel
  const [
    { count: memberCount },
    { data: savings },
    { data: activeLoans },
    { data: cashEntries }
  ] = await Promise.all([
    memberQuery,
    savingsQuery,
    loansQuery,
    cashQuery
  ])

  const savingsBreakdown = {
    pokok: 0,
    wajib: 0,
    sukarela: 0
  }

  const totalSavings = savings?.reduce((acc: number, curr: any) => {
    const amount = Number(curr.amount)
    const isDeposit = curr.type === 'deposit'
    const productName = curr.savings_products?.name?.toLowerCase()

    if (productName === 'pokok') {
      savingsBreakdown.pokok += isDeposit ? amount : -amount
    } else if (productName === 'wajib') {
      savingsBreakdown.wajib += isDeposit ? amount : -amount
    } else if (productName === 'sukarela') {
      savingsBreakdown.sukarela += isDeposit ? amount : -amount
    }

    return isDeposit ? acc + amount : acc - amount
  }, 0) || 0

  const totalActiveLoans = activeLoans?.reduce((acc: number, curr: any) => acc + Number(curr.principal), 0) || 0

  const currentCash = cashEntries?.reduce((acc: number, curr: any) => {
    return curr.type === 'in' ? acc + Number(curr.amount) : acc - Number(curr.amount)
  }, 0) || 0

  return {
    memberCount: memberCount || 0,
    totalSavings,
    savingsBreakdown,
    totalActiveLoans,
    currentCash,
  }
})

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
