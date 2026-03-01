import { Request, Response, NextFunction } from "express";
import type { MortgageCalculateInput } from "../types";

export interface ValidationError {
  field: string;
  message: string;
}

export function validateMortgageInput(
  req: Request<object, object, MortgageCalculateInput>,
  res: Response,
  next: NextFunction
): void {
  const errors: ValidationError[] = [];
  const { housePrice, downPayment, annualRate, termYears, extraMonthly } = req.body;

  if (housePrice == null || typeof housePrice !== "number")
    errors.push({ field: "housePrice", message: "housePrice is required and must be a number" });
  else if (housePrice <= 0)
    errors.push({ field: "housePrice", message: "housePrice must be positive" });

  if (downPayment == null || typeof downPayment !== "number")
    errors.push({ field: "downPayment", message: "downPayment is required and must be a number" });
  else if (downPayment < 0)
    errors.push({ field: "downPayment", message: "downPayment must be 0 or more" });
  else if (typeof housePrice === "number" && downPayment >= housePrice)
    errors.push({ field: "downPayment", message: "downPayment must be less than housePrice" });

  if (annualRate == null || typeof annualRate !== "number")
    errors.push({ field: "annualRate", message: "annualRate is required and must be a number" });
  else if (annualRate <= 0 || annualRate > 30)
    errors.push({ field: "annualRate", message: "annualRate must be between 0 and 30" });

  if (termYears == null || typeof termYears !== "number")
    errors.push({ field: "termYears", message: "termYears is required and must be a number" });
  else if (termYears <= 0 || termYears > 50)
    errors.push({ field: "termYears", message: "termYears must be between 1 and 50" });

  if (extraMonthly != null && (typeof extraMonthly !== "number" || extraMonthly < 0))
    errors.push({ field: "extraMonthly", message: "extraMonthly must be 0 or more" });

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
}

export function validateLoanUpdate(
  req: Request<object, object, Partial<MortgageCalculateInput>>,
  res: Response,
  next: NextFunction
): void {
  const errors: ValidationError[] = [];
  const body = req.body;

  if (body.housePrice != null && (typeof body.housePrice !== "number" || body.housePrice <= 0)) {
    errors.push({ field: "housePrice", message: "housePrice must be a positive number" });
  }
  if (body.downPayment != null && (typeof body.downPayment !== "number" || body.downPayment < 0)) {
    errors.push({ field: "downPayment", message: "downPayment must be 0 or more" });
  }
  if (body.annualRate != null && (typeof body.annualRate !== "number" || body.annualRate <= 0 || body.annualRate > 30)) {
    errors.push({ field: "annualRate", message: "annualRate must be between 0 and 30" });
  }
  if (body.termYears != null && (typeof body.termYears !== "number" || body.termYears <= 0 || body.termYears > 50)) {
    errors.push({ field: "termYears", message: "termYears must be between 1 and 50" });
  }
  if (body.extraMonthly != null && (typeof body.extraMonthly !== "number" || body.extraMonthly < 0)) {
    errors.push({ field: "extraMonthly", message: "extraMonthly must be 0 or more" });
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
}
