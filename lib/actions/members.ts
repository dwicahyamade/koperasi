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

  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()

  if (memberError) {
    throw new Error(memberError.message)
  }

  // Also fetch related savings and loans
  const { data: savings } = await supabase
    .from('savings_transactions')
    .select('*, savings_products(name)')
    .eq('member_id', id)

  const { data: loans } = await supabase
    .from('loans')
    .select('*, loan_products(name)')
    .eq('member_id', id)

  return {
    ...member,
    savings,
    loans,
  }
}
