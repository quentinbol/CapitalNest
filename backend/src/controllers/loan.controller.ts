import { Request, Response } from "express";
import type { MortgageCalculateInput } from "../types";
import { getLoan, updateLoan } from "../services/loan.service";

const DEFAULT_USER_ID = "default";

export function getLoanHandler(req: Request<{ userId?: string }>, res: Response): void {

  const userId = req.params.userId || DEFAULT_USER_ID;

  const loan = getLoan(userId);

  if (!loan) {
    res.status(404).json({ message: "Loan not found" });
    return;
  }

  res.json(loan);
}

export function updateLoanHandler(
  req: Request<{ userId?: string }, object, Partial<MortgageCalculateInput>>,
  res: Response
): void {

  const userId = req.params.userId || DEFAULT_USER_ID;

  const loan = updateLoan(userId, req.body);

  if (!loan) {
    res.status(404).json({ message: "Loan not found. Calculate a mortgage first." });
    return;
  }

  res.json(loan);
}
