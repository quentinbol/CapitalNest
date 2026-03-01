import { Router } from "express";
import { calculateMortgageHandler } from "../controllers/mortgage.controller";
import { validateMortgageInput } from "../middleware/validation";

const router = Router();

router.post("/calculate-mortgage", validateMortgageInput, calculateMortgageHandler);

export default router;
