'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats(startDate?: string, endDate?: string) {
  const supabase = await createClient()

  // 1. Total Members
  const { count: memberCount } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })

  // 2. Total Savings (Aggregate amount) with breakdown
  let savingsQuery = supabase
    .from('savings_transactions')
    .select('amount, type, savings_products(name)')

  if (startDate) {
    savingsQuery = savingsQuery.gte('created_at', startDate)
  }
  if (endDate) {
    // Add one day to endDate to include transactions on that day
    const nextDay = new Date(endDate)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayStr = nextDay.toISOString().split('T')[0]
    savingsQuery = savingsQuery.lt('created_at', nextDayStr)
  }

  const { data: savings } = await savingsQuery

  const savingsBreakdown = {
    pokok: 0,
    wajib: 0,
    sukarela: 0
  }

  const totalSavings = savings?.reduce((acc, curr: any) => {
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

  // 3. Total Loans (active/disbursed)
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

  const { data: activeLoans } = await loansQuery
  const totalActiveLoans = activeLoans?.reduce((acc, curr) => acc + Number(curr.principal), 0) || 0

  // 4. Current Cash Balance (from cash_book)
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

  const { data: cashEntries } = await cashQuery

  const currentCash = cashEntries?.reduce((acc, curr) => {
    return curr.type === 'in' ? acc + Number(curr.amount) : acc - Number(curr.amount)
  }, 0) || 0

  return {
    memberCount: memberCount || 0,
    totalSavings,
    savingsBreakdown,
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
