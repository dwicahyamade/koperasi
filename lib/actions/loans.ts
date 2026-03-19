'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function requestLoan(formData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('loans')
    .insert([
      {
        member_id: formData.member_id,
        product_id: formData.product_id,
        principal: formData.principal,
        interest_rate: formData.interest_rate,
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

  // 4. Generate Installments schedule
  const installments = []
  const startDate = new Date()
  for (let i = 1; i <= loan.tenor_months; i++) {
    const dueDate = new Date(startDate)
    dueDate.setMonth(startDate.getMonth() + i)
    
    installments.push({
      loan_id: loan.id,
      installment_number: i,
      due_date: dueDate.toISOString().split('T')[0],
      principal_amount: loan.principal / loan.tenor_months,
      interest_amount: (loan.principal * (loan.interest_rate / 100)),
      paid_amount: 0,
    })
  }

  await supabase.from('loan_installments').insert(installments)

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

export async function getLoanProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('loan_products')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

export async function createLoanProduct(data: any) {
  const supabase = await createClient()
  const { error } = await supabase.from('loan_products').insert([data])
  if (error) throw new Error(error.message)
  revalidatePath('/(dashboard)/pengaturan/produk')
  return { success: true }
}

export async function updateLoanProduct(id: string, data: any) {
  const supabase = await createClient()
  const { error } = await supabase.from('loan_products').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/(dashboard)/pengaturan/produk')
  return { success: true }
}

export async function deleteLoanProduct(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('loan_products').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/(dashboard)/pengaturan/produk')
  return { success: true }
}
