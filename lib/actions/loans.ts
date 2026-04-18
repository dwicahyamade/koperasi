'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getLoans() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('loans')
    .select('*, members(full_name)')
    .order('created_at', { ascending: false })
    
  if (error) throw new Error(error.message)
  return data
}

export async function requestLoan(formData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('loans')
    .insert([
      {
        member_id: formData.member_id,
        borrower_name: formData.borrower_name,
        principal: formData.principal,
        interest_rate: formData.interest_rate,
        interest_type: formData.interest_type || 'flat',
        tenor_months: formData.tenor_months,
        status: 'pending',
        created_by: user?.id,
      },
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/(dashboard)/pinjaman')
  return data
}

export async function approveLoan(loanId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('loans')
    .update({ 
      status: 'approved',
      approved_by: user?.id 
    })
    .eq('id', loanId)
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/(dashboard)/pinjaman')
  return data
}

export async function disburseLoan(loanId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Get loan details
  const { data: loan, error: loanError } = await supabase
    .from('loans')
    .select('*')
    .eq('id', loanId)
    .single()

  if (loanError) throw new Error(loanError.message)

  // 2. Mark as disbursed
  const { error: updateError } = await supabase
    .from('loans')
    .update({ 
      status: 'disbursed',
      disbursed_at: new Date().toISOString()
    })
    .eq('id', loanId)

  if (updateError) throw new Error(updateError.message)

  // 3. Create Cash Book entry (Outflow)
  await supabase.from('cash_book').insert([
    {
      type: 'out',
      category: 'loan_disbursement',
      amount: loan.principal,
      description: `Disbursement of loan ${loan.id}`,
      reference_id: loan.id,
      created_by: user?.id,
    },
  ])

  revalidatePath('/(dashboard)/pinjaman')
  return { success: true }
}

export async function recordInstallmentPayment(installmentId: string, amount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Update installment
  const { data: installment, error: instError } = await supabase
    .from('loan_installments')
    .update({
      paid_amount: amount,
      paid_at: new Date().toISOString(),
      recorded_by: user?.id
    })
    .eq('id', installmentId)
    .select('*, loans(*)')
    .single()

  if (instError) throw new Error(instError.message)

  // 2. Cash book entry (Inflow)
  await supabase.from('cash_book').insert([
    {
      type: 'in',
      category: 'loan_installment',
      amount: amount,
      description: `Installment payment for loan ${installment.loan_id} #${installment.installment_number}`,
      reference_id: installment.id,
      created_by: user?.id,
    },
  ])

  // 3. Check if fully paid
  const { data: remaining } = await supabase
    .from('loan_installments')
    .select('paid_amount')
    .eq('loan_id', installment.loan_id)
    .is('paid_at', null)

  if (remaining && remaining.length === 0) {
    await supabase.from('loans').update({ status: 'closed' }).eq('id', installment.loan_id)
  }

  revalidatePath('/(dashboard)/pinjaman')
  return { success: true }
}

export async function addManualPayment(loanId: string, paidAt: string, principal: number, interest: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Get current count for installment number
  const { count } = await supabase
    .from('loan_installments')
    .select('*', { count: 'exact', head: true })
    .eq('loan_id', loanId)

  const installmentNumber = (count || 0) + 1

  // 2. Insert record
  const { data, error } = await supabase
    .from('loan_installments')
    .insert([
      {
        loan_id: loanId,
        installment_number: installmentNumber,
        due_date: paidAt,
        principal_amount: principal,
        interest_amount: interest,
        paid_at: new Date(paidAt).toISOString(),
        paid_amount: principal + interest,
        recorded_by: user?.id
      }
    ])
    .select()
    .single()

  if (error) throw new Error(error.message)

  // 3. Cash book entry
  await supabase.from('cash_book').insert([
    {
      type: 'in',
      category: 'loan_installment',
      amount: principal + interest,
      description: `Manual payment for loan ${loanId} #${installmentNumber} (P: ${principal}, I: ${interest})`,
      reference_id: data.id,
      created_by: user?.id,
    },
  ])

  revalidatePath(`/(dashboard)/pinjaman/${loanId}`)
  return { success: true }
}

export async function deleteInstallment(id: string) {
  const supabase = await createClient()
  
  // Delete related cash book entry
  await supabase.from('cash_book').delete().eq('reference_id', id)

  const { error } = await supabase
    .from('loan_installments')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/(dashboard)/pinjaman', 'layout')
  return { success: true }
}
