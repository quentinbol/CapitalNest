import { Request, Response } from "express";
import type { MortgageCalculateInput } from "../types";
import { calculateMortgage } from "../services/mortgage.service";
import { saveLoan } from "../services/loan.service";

const DEFAULT_USER_ID = "default";

export function calculateMortgageHandler(req: Request<object, object, MortgageCalculateInput>, res: Response): void {

  const input = req.body;

  const result = calculateMortgage(input);

  saveLoan(DEFAULT_USER_ID, input, result);
  res.json(result);
}
