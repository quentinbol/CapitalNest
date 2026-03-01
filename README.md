# CapitalNest — Mortgage Calculator

A full-stack mortgage calculator built with **Express.js** (backend) and **React** (frontend) using TypeScript throughout.

---

## Project Structure

```
├── backend/        # Express.js API (typescript)
├── front/          # React + Vite frontend (typescript)
└── shared/         # Shared TypeScript types (contract types)
```

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher

---

## Setup & Installation

### 1. Install dependencies — Backend

```bash
cd backend
npm install
```

### 2. Install dependencies — Frontend

```bash
cd ../front
npm install
```

> The `shared/` folder contains TypeScript types used by both projects and requires no separate installation.

---

## Running the Application

You need to run two terminals, one for the backend, one for the frontend.

### Terminal 1: Start the backend (port 3000)

```bash
cd backend
npm run dev
```

You should see:
```
Server running on http://localhost:3000
```

### Terminal 2: Start the frontend (port 5173)

```bash
cd front
npm run dev
```

You should see:
```
http://localhost:5173/
```

### Open the app

Navigate to **http://localhost:5173** in your browser.

---

## API Endpoint

### `POST /calculate-mortgage`

Calculates the monthly mortgage payment.

**Request body (JSON):**

| Field | Type | Required | Description |
|---|---|---|---|
| `housePrice` | number | Yes | Total price of the house |
| `downPayment` | number | Yes | Down payment amount (0 or more, less than housePrice) |
| `annualRate` | number | Yes | Annual interest rate in % (between 0 and 30) |
| `termYears` | number | Yes | Loan term in years (between 1 and 50) |
| `extraMonthly` | number | No | Optional extra monthly payment |

**Example request:**

```bash
curl -X POST http://localhost:3000/calculate-mortgage \
  -H "Content-Type: application/json" \
  -d '{
    "housePrice": 400000,
    "downPayment": 80000,
    "annualRate": 5,
    "termYears": 25
  }'
```

**Example response:**

```json
{
  "monthlyPayment": 1886.98,
  "totalPaid": 566094.00,
  "totalInterest": 246094.00,
  "loanAmount": 320000,
  "annualRate": 5,
  "termYears": 25,
  "loanEndDate": "2050-02-28",
  "amortizationSchedule": [
    { "year": 0, "balance": 320000, "cumulativePrincipal": 0, "cumulativeInterest": 0 },
    { "year": 1, "balance": 308477, "cumulativePrincipal": 11523, "cumulativeInterest": 11121 },
    "..."
  ]
}
```

---

## Example Inputs & Outputs

### Example 1 — Standard mortgage

| Field | Value |
|---|---|
| House Price | $400,000 |
| Down Payment | $80,000 (20%) |
| Annual Rate | 5% |
| Loan Term | 25 years |

**Result:**
- Monthly Payment: **$1,887**
- Loan Amount: $320,000
- Total Interest: ~$246,094
- Total Paid: ~$566,094

---

### Example 2 — Higher rate, shorter term

| Field | Value |
|---|---|
| House Price | $550,000 |
| Down Payment | $55,000 (10%) |
| Annual Rate | 6.5% |
| Loan Term | 20 years |

**Result:**
- Monthly Payment: **$3,889**
- Loan Amount: $495,000
- Total Interest: ~$438,360
- Total Paid: ~$933,360

---

### Example 3 — With extra monthly payment

| Field | Value |
|---|---|
| House Price | $300,000 |
| Down Payment | $60,000 |
| Annual Rate | 4.5% |
| Loan Term | 30 years |
| Extra Monthly | $200 |

**Result:**
- Monthly Payment: **$1,416** (including $200 extra)
- Loan paid off earlier than the original 30-year term

---

## Mortgage Formula

Monthly payment is calculated as:

![Mortgame Formula](https://www.dsldmortgage.com/wp-content/uploads/2024/07/formula.png)

Where:
- **M** = monthly payment
- **P** = loan amount (house price − down payment)
- **r** = monthly interest rate (annual rate ÷ 12 ÷ 100)
- **n** = total number of monthly payments (years × 12)

---

## Input Validation

The backend rejects invalid requests with a `400` status and an error array:

```json
{
  "errors": [
    { "field": "annualRate", "message": "annualRate must be between 0 and 30" }
  ]
}
```

The frontend also validates all fields before sending the request and displays user-friendly error messages inline.