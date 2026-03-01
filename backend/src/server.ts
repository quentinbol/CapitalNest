import "dotenv/config";
import express from "express";
import cors from "cors";
import mortgageRoutes from "./routes/mortgage.routes";
import loanRoutes from "./routes/loan.routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Mortgage API" });
});

app.use("/", mortgageRoutes);
app.use("/loan", loanRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
