const API_BASE = "/api";

import type { MortgageCalculateInput, MortgageCalculateResult, LoanData } from "../../../shared/contractType";


export async function calculateMortgage(input: MortgageCalculateInput): Promise<MortgageCalculateResult> {

  const res = await fetch(`${API_BASE}/calculate-mortgage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err.errors) ? err.errors[0]?.message : err.message;
    throw new Error(msg ?? "Calculation failed");
  }

  return res.json();
}

export async function getLoan(userId = "default"): Promise<LoanData | null> {

  const res = await fetch(`${API_BASE}/loan/${userId}`);

  if (res.status === 404)
    return null;

  if (!res.ok)
    throw new Error("Failed to fetch loan");

  return res.json();
}

export async function updateLoan(
  userId: string,
  input: Partial<MortgageCalculateInput>
): Promise<LoanData> {

  const res = await fetch(`${API_BASE}/loan/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err.errors) ? err.errors[0]?.message : err.message;
    throw new Error(msg ?? "Update failed");
  }

  return res.json();
}
