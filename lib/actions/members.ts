'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createMember(formData: any) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('members')
    .insert([
      {
        kta_number: formData.kta_number,
        full_name: formData.full_name,
        nik: formData.nik,
        phone: formData.phone,
        address: formData.address,
        status: 'active',
        registered_at: new Date().toISOString().split('T')[0],
      },
    ])
    .select()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/(dashboard)/anggota')
  return data[0]
}

export async function updateMember(id: string, formData: any) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('members')
    .update({
      full_name: formData.full_name,
      phone: formData.phone,
      address: formData.address,
      status: formData.status,
    })
    .eq('id', id)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/(dashboard)/anggota')
  revalidatePath(`/(dashboard)/anggota/${id}`)
  return data[0]
}

export async function getMembers() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('members')
    .select('*, savings_transactions(amount, type, savings_products(name))')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function getMemberDetail(id: string) {
  const supabase = await createClient()

  const [
    { data: member, error: memberError },
    { data: savings },
    { data: loans }
  ] = await Promise.all([
    supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single(),
    supabase
      .from('savings_transactions')
      .select('*, savings_products(name)')
      .eq('member_id', id),
    supabase
      .from('loans')
      .select('*')
      .eq('member_id', id)
  ])

  if (memberError) {
    throw new Error(memberError.message)
  }

  return {
    ...member,
    savings,
    loans,
  }
}

export async function deleteMember(id: string) {
  const supabase = await createClient()

  // Check for active loans
  const { data: activeLoans } = await supabase
    .from('loans')
    .select('id')
    .eq('member_id', id)
    .in('status', ['pending', 'approved', 'disbursed'])
    .limit(1)

  if (activeLoans && activeLoans.length > 0) {
    throw new Error('Anggota masih memiliki pinjaman aktif. Selesaikan semua pinjaman terlebih dahulu.')
  }

  // Check for savings balance
  const { data: savingsTxs } = await supabase
    .from('savings_transactions')
    .select('amount, type')
    .eq('member_id', id)

  if (savingsTxs && savingsTxs.length > 0) {
    const balance = savingsTxs.reduce((sum, tx) => {
      return sum + (tx.type === 'deposit' ? Number(tx.amount) : -Number(tx.amount))
    }, 0)

    if (balance > 0) {
      throw new Error('Anggota masih memiliki saldo simpanan. Tarik semua simpanan terlebih dahulu.')
    }
  }

  const { data, error } = await supabase
    .from('members')
    .delete()
    .eq('id', id)
    .select()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || data.length === 0) {
    throw new Error('Gagal menghapus anggota. Anda tidak memiliki izin atau anggota tidak ditemukan.')
  }

  revalidatePath('/(dashboard)/anggota')
}
