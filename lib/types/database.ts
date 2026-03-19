export type Profile = {
  id: string
  full_name: string | null
  role: 'admin' | 'manager'
  created_at: string
}

export type Member = {
  id: string
  kta_number: string
  full_name: string
  nik: string
  phone: string | null
  address: string | null
  status: 'active' | 'inactive'
  registered_at: string
  created_at: string
}

export type SavingsProduct = {
  id: string
  name: string
  minimum_amount: number
  is_mandatory: boolean
}

export type SavingsTransaction = {
  id: string
  member_id: string
  product_id: string
  type: 'deposit' | 'withdrawal'
  amount: number
  notes: string | null
  created_by: string
  created_at: string
}

export type LoanProduct = {
  id: string
  name: string
  interest_rate: number
  late_fee: number
  max_tenor_months: number
}

export type Loan = {
  id: string
  member_id: string
  product_id: string
  principal: number
  interest_rate: number
  tenor_months: number
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'closed'
  approved_by: string | null
  disbursed_at: string | null
  created_by: string
  created_at: string
}

export type LoanInstallment = {
  id: string
  loan_id: string
  installment_number: number
  due_date: string
  principal_amount: number
  interest_amount: number
  paid_amount: number
  paid_at: string | null
  recorded_by: string | null
}

export type CashBookEntry = {
  id: string
  type: 'in' | 'out'
  category: 'savings_deposit' | 'savings_withdrawal' | 'loan_disbursement' | 'loan_installment' | 'other'
  amount: number
  description: string | null
  reference_id: string | null
  created_by: string
  created_at: string
}
