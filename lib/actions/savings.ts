'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addSavingsTransaction(formData: any) {
  const supabase = await createClient()

  // 1. Get the current user for created_by
  const { data: { user } } = await supabase.auth.getUser()

  // Validate Simpanan Pokok: Only 1x per member for deposit
  if (formData.type === 'deposit') {
    const { data: product } = await supabase
      .from('savings_products')
      .select('name')
      .eq('id', formData.product_id)
      .single()

    if (product && product.name.toLowerCase().includes('pokok')) {
      const { data: existingDeposits } = await supabase
        .from('savings_transactions')
        .select('id')
        .eq('member_id', formData.member_id)
        .eq('product_id', formData.product_id)
        .eq('type', 'deposit')

      if (existingDeposits && existingDeposits.length > 0) {
        throw new Error("Anggota ini sudah memiliki catatan setoran untuk Simpanan Pokok. Simpanan Pokok hanya dapat disetor 1x.")
      }
    }
  }

  // 2. Insert into savings_transactions
  const { data: transaction, error: transError } = await supabase
    .from('savings_transactions')
    .insert([
      {
        member_id: formData.member_id,
        product_id: formData.product_id,
        type: formData.type, // 'deposit' or 'withdrawal'
        amount: formData.amount,
        notes: formData.notes,
        created_by: user?.id,
        ...(formData.date ? { created_at: new Date(`${formData.date}T12:00:00Z`).toISOString() } : {}),
      },
    ])
    .select()
    .single()

  if (transError) {
    throw new Error(transError.message)
  }



  revalidatePath('/(dashboard)/simpanan')
  revalidatePath(`/(dashboard)/anggota/${formData.member_id}`)
  return transaction
}

export async function getSavingsProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('savings_products')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

export async function getSavingsReport(memberId?: string, startDate?: string, endDate?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('savings_transactions')
    .select('*, members(full_name), savings_products(name)')
    .order('created_at', { ascending: false })

  if (memberId) {
    query = query.eq('member_id', memberId)
  }

  if (startDate) {
    query = query.gte('created_at', startDate)
  }

  if (endDate) {
    // Add one day to include the whole end day
    const nextDay = new Date(endDate)
    nextDay.setDate(nextDay.getDate() + 1)
    const nextDayStr = nextDay.toISOString().split('T')[0]
    query = query.lt('created_at', nextDayStr)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}


export async function createSavingsProduct(data: any) {
  const supabase = await createClient()
  const { error } = await supabase.from('savings_products').insert([data])
  if (error) throw new Error(error.message)
  revalidatePath('/(dashboard)/pengaturan/produk')
  return { success: true }
}

export async function updateSavingsProduct(id: string, data: any) {
  const supabase = await createClient()
  const { error } = await supabase.from('savings_products').update(data).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/(dashboard)/pengaturan/produk')
  return { success: true }
}

export async function deleteSavingsProduct(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('savings_products').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/(dashboard)/pengaturan/produk')
  return { success: true }
}
