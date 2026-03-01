import type { LoanData, MortgageCalculateInput, MortgageCalculateResult } from "../types";
import { calculateMortgage } from "./mortgage.service";

const loanStore = new Map<string, LoanData>();

export function getLoan(userId: string): LoanData | null {
  return loanStore.get(userId) ?? null;
}

export function saveLoan(
  userId: string,
  input: MortgageCalculateInput,
  result: MortgageCalculateResult
): LoanData {
  const now = new Date().toISOString();
  const existing = loanStore.get(userId);

  const loan: LoanData = {
    ...result,
    housePrice: input.housePrice,
    downPayment: input.downPayment,
    extraMonthly: input.extraMonthly ?? 0,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  loanStore.set(userId, loan);
  return loan;
}

export function updateLoan(
  userId: string,
  input: Partial<MortgageCalculateInput>
): LoanData | null {
  const existing = loanStore.get(userId);
  if (!existing) return null;

  const fullInput: MortgageCalculateInput = {
    housePrice: input.housePrice ?? existing.housePrice,
    downPayment: input.downPayment ?? existing.downPayment,
    annualRate: input.annualRate ?? existing.annualRate,
    termYears: input.termYears ?? existing.termYears,
    extraMonthly: input.extraMonthly ?? existing.extraMonthly,
  };

  const result = calculateMortgage(fullInput);
  return saveLoan(userId, fullInput, result);
}
