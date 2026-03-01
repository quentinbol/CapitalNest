export interface MortgageCalculateInput {
    housePrice: number;
    downPayment: number;
    annualRate: number;
    termYears: number;
    extraMonthly?: number;
}

export interface AmortizationYear {
    year: number;
    balance: number;
    cumulativePrincipal: number;
    cumulativeInterest: number;
}

export interface MortgageCalculateResult {
    monthlyPayment: number;
    totalPaid: number;
    totalInterest: number;
    loanAmount: number;
    annualRate: number;
    termYears: number;
    loanEndDate: string;
    amortizationSchedule: AmortizationYear[];
}

export interface LoanData extends MortgageCalculateResult {
    housePrice: number;
    downPayment: number;
    extraMonthly: number;
    createdAt: string;
    updatedAt: string;
}