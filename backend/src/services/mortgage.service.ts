import type { MortgageCalculateInput, MortgageCalculateResult } from "../types";

export function calculateMortgage(input: MortgageCalculateInput): MortgageCalculateResult {
  const { housePrice, downPayment, annualRate, termYears, extraMonthly = 0 } = input;

  const P = housePrice - downPayment;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;

  const M = r === 0 ? P / n : (P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);

  const amortizationSchedule: { year: number; balance: number; cumulativePrincipal: number; cumulativeInterest: number }[] = [
    { year: 0, balance: P, cumulativePrincipal: 0, cumulativeInterest: 0 },
  ];

  let balance = P;
  let monthsPaid = 0;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;

  for (let month = 1; month <= n; month++) {

    const interestPayment = balance * r;

    const principalPayment = M - interestPayment + extraMonthly;

    balance = Math.max(0, balance - principalPayment);
    monthsPaid = month;
    cumulativePrincipal += principalPayment;
    cumulativeInterest += interestPayment;

    if (month % 12 === 0) {
  
      amortizationSchedule.push({
        year: month / 12,
        balance,
        cumulativePrincipal,
        cumulativeInterest,
      });
    }
  
    if (balance <= 0)
      break;
  }

  const totalPaid = (M + extraMonthly) * monthsPaid;
  const totalInterest = totalPaid - P;

  const loanEndDate = new Date();
  loanEndDate.setMonth(loanEndDate.getMonth() + monthsPaid);

  return {
    monthlyPayment: M + extraMonthly,
    totalPaid,
    totalInterest,
    loanAmount: P,
    annualRate,
    termYears,
    loanEndDate: loanEndDate.toISOString().split("T")[0],
    amortizationSchedule,
  };
}
