/**
 * Loan calculation types
 */
export type InterestType = 'flat' | 'effective'

export interface Installment {
  month: number
  dueDate?: string
  principal: number
  interest: number
  total: number
  remaining: number
}

export interface LoanSchedule {
  monthlyInstallment?: number // Only for flat, as effective varies
  totalInterest: number
  totalPayment: number
  installments: Installment[]
}

/**
 * Generates an installment schedule based on interest type
 */
export function calculateLoanSchedule(
  principal: number,
  monthlyRatePercent: number,
  tenorMonths: number,
  type: InterestType = 'flat'
): LoanSchedule {
  const i = monthlyRatePercent / 100
  let totalInterest = 0
  const installments: Installment[] = []

  if (type === 'flat') {
    const interestPerMonth = principal * i
    const principalPerMonth = principal / tenorMonths
    const totalPerMonth = principalPerMonth + interestPerMonth
    
    for (let m = 1; m <= tenorMonths; m++) {
      installments.push({
        month: m,
        principal: principalPerMonth,
        interest: interestPerMonth,
        total: totalPerMonth,
        remaining: Math.max(0, principal - (principalPerMonth * m))
      })
    }
    
    totalInterest = interestPerMonth * tenorMonths
    
    return {
      monthlyInstallment: totalPerMonth,
      totalInterest,
      totalPayment: principal + totalInterest,
      installments
    }
  } else {
    // Effective / Sliding
    // Principal installment is fixed: Total Principal / Tenor
    // Interest is calculated based on remaining balance
    const principalPerMonth = principal / tenorMonths
    let remainingBalance = principal
    let totalPaidInterest = 0

    for (let m = 1; m <= tenorMonths; m++) {
      const interestForMonth = remainingBalance * i
      const totalForMonth = principalPerMonth + interestForMonth
      
      remainingBalance -= principalPerMonth
      totalPaidInterest += interestForMonth
      
      installments.push({
        month: m,
        principal: principalPerMonth,
        interest: interestForMonth,
        total: totalForMonth,
        remaining: Math.max(0, remainingBalance)
      })
    }

    return {
      totalInterest: totalPaidInterest,
      totalPayment: principal + totalPaidInterest,
      installments
    }
  }
}
