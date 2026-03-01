import { Router } from "express";
import { getLoanHandler, updateLoanHandler } from "../controllers/loan.controller";
import { validateLoanUpdate } from "../middleware/validation";

const router = Router();

router.get("/", getLoanHandler);

router.get("/:userId", getLoanHandler);

router.put("/", validateLoanUpdate, updateLoanHandler);

router.put("/:userId", validateLoanUpdate, updateLoanHandler);

export default router;
