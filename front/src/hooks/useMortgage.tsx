import { useMemo } from "react"

const useMortgage = (housePrice: number, downPayment: number, annualRate: number, termYears: number, extraMonthly: number) => {

    const P = housePrice - downPayment
    const r = annualRate / 100 / 12
    const n = termYears * 12

    const M = useMemo(() => r === 0 ? P / n : P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1), [P, r, n])

    let balance = useMemo(() => P, [P])
    const amortizationSchedule: { year: number; balance: number }[] = [{ year: 0, balance: P }]

    for (let month = 1; month <= n; month++) {
        const interestPayment = balance * r
        const principalPayment = M - interestPayment + extraMonthly
        balance = Math.max(0, balance - principalPayment)
        if (month % 12 === 0) {
            amortizationSchedule.push({ year: month / 12, balance })
        }
        if (balance === 0) break
    }

    const totalPaid = useMemo(() => M * n + extraMonthly * n, [M, n, extraMonthly])
    const totalInterest = useMemo(() => totalPaid - P, [totalPaid, P])

    return {
        monthlyPayment: M + extraMonthly,
        totalPaid,
        totalInterest,
        loanAmount: P,
        annualRate,
        termYears,
        amortizationSchedule,
    }
}

export default useMortgage;