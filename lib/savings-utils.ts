export function calculateSavingsBreakdown(savingsData: any[]) {
  const breakdown = {
    pokok: 0,
    wajib: 0,
    sukarela: 0
  }

  let totalSavings = 0
  let totalDeposits = 0
  let totalWithdrawals = 0

  if (!savingsData || !Array.isArray(savingsData)) {
    return { breakdown, totalSavings, totalDeposits, totalWithdrawals }
  }

  savingsData.forEach((curr: any) => {
    const amount = Number(curr.amount)
    const isDeposit = curr.type === 'deposit'
    const productName = curr.savings_products?.name?.toLowerCase()

    if (isDeposit) {
      totalDeposits += amount
      totalSavings += amount
    } else {
      totalWithdrawals += amount
      totalSavings -= amount
    }

    if (productName === 'pokok' || productName?.includes('pokok')) {
      breakdown.pokok += isDeposit ? amount : -amount
    } else if (productName === 'wajib' || productName?.includes('wajib')) {
      breakdown.wajib += isDeposit ? amount : -amount
    } else if (productName === 'sukarela' || productName?.includes('sukarela')) {
      breakdown.sukarela += isDeposit ? amount : -amount
    }
  })

  return { breakdown, totalSavings, totalDeposits, totalWithdrawals }
}
