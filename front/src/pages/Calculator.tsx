import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    type TooltipItem,
} from "chart.js"
import { Line } from "react-chartjs-2"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { calculateMortgage, getLoan } from "@/api/mortgage"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

type FormValues = {
    housePrice: string
    downPayment: string
    annualRate: string
    termYears: string
    extraMonthly: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

export type MortgageResult = {
    monthlyPayment: number
    totalPaid: number
    totalInterest: number
    loanAmount: number
    annualRate: number
    termYears: number
    loanEndDate?: string
    amortizationSchedule: { year: number; balance: number }[]
}

const validate = (values: FormValues): FormErrors => {
    const errors: FormErrors = {}
    const price = parseFloat(values.housePrice)
    const down = parseFloat(values.downPayment)
    const rate = parseFloat(values.annualRate)
    const term = parseFloat(values.termYears)
    const extra = parseFloat(values.extraMonthly)

    if (!values.housePrice)
        errors.housePrice = "Required"
    else if (isNaN(price) || price <= 0)
        errors.housePrice = "Must be a positive number"

    if (values.downPayment !== "") {
        if (isNaN(down) || down < 0)
            errors.downPayment = "Must be 0 or more"
        else if (!isNaN(price) && down >= price)
            errors.downPayment = "Must be less than house price"
    }

    if (!values.annualRate)
        errors.annualRate = "Required"
    else if (isNaN(rate) || rate <= 0)
        errors.annualRate = "Must be a positive number"
    else if (rate > 30)
        errors.annualRate = "Rate seems too high (max 30%)"

    if (!values.termYears)
        errors.termYears = "Required"
    else if (isNaN(term) || term <= 0)
        errors.termYears = "Must be a positive number"
    else if (term > 50)
        errors.termYears = "Term too long (max 50 years)"

    if (values.extraMonthly !== "" && (isNaN(extra) || extra < 0))
        errors.extraMonthly = "Must be 0 or more"

    return errors
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value)

const BalanceChart = ({ schedule }: { schedule: { year: number; balance: number }[] }) => {
    const data = {
        labels: schedule.map((p) => `Y${p.year}`),
        datasets: [
            {
                label: "Remaining Balance",
                data: schedule.map((p) => p.balance),
                borderColor: "rgb(10, 10, 10)",
                backgroundColor: "rgba(10, 10, 10, 0.06)",
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgb(10, 10, 10)",
                borderWidth: 2,
            },
        ],
    }

    const options = {
        maintainAspectRatio: false,
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: {
                    font: { size: 10 },
                    maxTicksLimit: 8,
                    color: "#9ca3af",
                },
            },
            y: {
                grid: { color: "rgba(0,0,0,0.04)" },
                border: { display: false },
                ticks: {
                    font: { size: 10 },
                    maxTicksLimit: 5,
                    color: "#9ca3af",
                    callback: (value: number | string) =>
                        `$${(Number(value) / 1000).toFixed(0)}k`,
                },
            },
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx: TooltipItem<"line">) => ` ${formatCurrency(ctx.parsed.y as number)}`,
                    title: (items: TooltipItem<"line">[]) => `Year ${schedule[items[0].dataIndex].year}`,
                },
            },
        },
    }

    return <Line data={data} options={options} />
}

const ResultPanel = ({ result }: { result: MortgageResult }) => {
    const costRatio = (result.totalPaid / result.loanAmount).toFixed(2)
    const interestRatio = ((result.totalInterest / result.loanAmount) * 100).toFixed(1)

    return (
        <div className="flex flex-col gap-4">
            <Card className="border-neutral-900 bg-neutral-900 text-white">
                <CardHeader>
                    <CardTitle className="text-base text-2xl">Monthly Payment</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <p className="text-5xl font-bold mt-1">{formatCurrency(result.monthlyPayment)}</p>
                    <p className="text-sm text-neutral-400 mt-2">
                        {result.annualRate}% rate · {result.termYears}-year term
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">Remaining Balance</CardTitle>
                    <CardDescription className="text-xs">How your balance decreases over time</CardDescription>
                </CardHeader>
                <CardContent className="h-[200px]">
                    <BalanceChart schedule={result.amortizationSchedule} />
                </CardContent>
            </Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Loan Amount</TableHead>
                        <TableHead>Total Interest</TableHead>
                        <TableHead>Total Paid</TableHead>
                        <TableHead>Total Cost Ratio</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>{formatCurrency(result.loanAmount)}</TableCell>
                        <TableCell>{formatCurrency(result.totalInterest)}</TableCell>
                        <TableCell>{formatCurrency(result.totalPaid)}</TableCell>
                        <TableCell>{costRatio}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <Card>
                <CardContent className="pt-4">
                    <div className="flex justify-between text-xs text-neutral-500 mb-1">
                        <span>Principal</span>
                        <span>Interest ({interestRatio}%)</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-neutral-100 overflow-hidden flex">
                        <div
                            className="h-full bg-neutral-900 transition-all duration-500"
                            style={{ width: `${(result.loanAmount / result.totalPaid) * 100}%` }}
                        />
                        <div
                            className="h-full bg-red-400 transition-all duration-500"
                            style={{ width: `${(result.totalInterest / result.totalPaid) * 100}%` }}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

const emptyForm: FormValues = {
    housePrice: "",
    downPayment: "",
    annualRate: "",
    termYears: "",
    extraMonthly: "",
}

export const CalculatorForm = ({ onResult, initialValues }: { onResult: (result: MortgageResult | null) => void; initialValues?: FormValues }) => {
    const [values, setValues] = useState<FormValues>(initialValues ?? emptyForm)
    const [errors, setErrors] = useState<FormErrors>({})
    const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({})
    const [loading, setLoading] = useState(false)
    const [apiError, setApiError] = useState<string | null>(null)

    const handleChange = (field: keyof FormValues, value: string) => {
        const newValues = { ...values, [field]: value }
        setValues(newValues)
        setApiError(null)
        if (touched[field]) setErrors(validate(newValues))
    }

    const handleBlur = (field: keyof FormValues) => {
        setTouched((prev) => ({ ...prev, [field]: true }))
        setErrors(validate(values))
    }

    const handleSubmit = async (e: React.FormEvent) => {

        e.preventDefault()

        const allTouched = Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {})
        setTouched(allTouched)

        const errs = validate(values)
        setErrors(errs)

        if (Object.keys(errs).length > 0) return

        setLoading(true)
        setApiError(null)

        try {
            const input = {
                housePrice: parseFloat(values.housePrice),
                downPayment: parseFloat(values.downPayment || "0"),
                annualRate: parseFloat(values.annualRate),
                termYears: parseFloat(values.termYears),
                extraMonthly: parseFloat(values.extraMonthly || "0"),
            }
            const result = await calculateMortgage(input)
            onResult(result as MortgageResult)
        } catch (err) {
            setApiError(err instanceof Error ? err.message : "Calculation failed")
        } finally {
            setLoading(false)
        }
    }

    const handleReset = () => {
        setValues({ housePrice: "", downPayment: "", annualRate: "", termYears: "", extraMonthly: "" })
        setErrors({})
        setTouched({})
        onResult(null)
    }

    const fieldClass = (field: keyof FormValues) =>
        touched[field] && errors[field] ? "border-red-400 focus-visible:ring-red-300" : ""

    const downPct = values.housePrice && values.downPayment && !errors.downPayment && !errors.housePrice
        ? parseFloat(values.downPayment) / parseFloat(values.housePrice)
        : null

    return (
        <Card className="w-full h-full">
            <CardHeader>
                <CardTitle>Mortgage Calculator</CardTitle>
                <CardDescription>Enter your loan details to calculate your monthly payment</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} noValidate>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="house-price">House Price <span className="text-red-400">*</span></FieldLabel>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                                <Input id="house-price" type="number" placeholder="350,000" min={0}
                                    className={`pl-7 ${fieldClass("housePrice")}`}
                                    value={values.housePrice}
                                    onChange={(e) => handleChange("housePrice", e.target.value)}
                                    onBlur={() => handleBlur("housePrice")} />
                            </div>
                            {touched.housePrice && errors.housePrice && <p className="text-xs text-red-500 mt-1">{errors.housePrice}</p>}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="down-payment">
                                Down Payment
                                {downPct !== null && (
                                    <span className="ml-2 text-xs text-neutral-400 font-normal">({(downPct * 100).toFixed(1)}%)</span>
                                )}
                            </FieldLabel>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                                <Input id="down-payment" type="number" placeholder="70,000" min={0}
                                    className={`pl-7 ${fieldClass("downPayment")}`}
                                    value={values.downPayment}
                                    onChange={(e) => handleChange("downPayment", e.target.value)}
                                    onBlur={() => handleBlur("downPayment")} />
                            </div>
                            {touched.downPayment && errors.downPayment && <p className="text-xs text-red-500 mt-1">{errors.downPayment}</p>}
                            {downPct !== null && downPct < 0.2 && (
                                <p className="text-xs text-amber-500 mt-1">⚠ Less than 20% — mortgage insurance may apply</p>
                            )}
                        </Field>

                        <div className="grid grid-cols-2 gap-4">
                            <Field>
                                <FieldLabel htmlFor="annual-rate">Annual Rate <span className="text-red-400">*</span></FieldLabel>
                                <div className="relative">
                                    <Input id="annual-rate" type="number" placeholder="5.25" step="0.01" min={0}
                                        className={`pr-7 ${fieldClass("annualRate")}`}
                                        value={values.annualRate}
                                        onChange={(e) => handleChange("annualRate", e.target.value)}
                                        onBlur={() => handleBlur("annualRate")} />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
                                </div>
                                {touched.annualRate && errors.annualRate && <p className="text-xs text-red-500 mt-1">{errors.annualRate}</p>}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="term-years">Loan Term <span className="text-red-400">*</span></FieldLabel>
                                <div className="relative">
                                    <Input id="term-years" type="number" placeholder="25" min={1} max={50}
                                        className={`pr-14 ${fieldClass("termYears")}`}
                                        value={values.termYears}
                                        onChange={(e) => handleChange("termYears", e.target.value)}
                                        onBlur={() => handleBlur("termYears")} />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">yrs</span>
                                </div>
                                {touched.termYears && errors.termYears && <p className="text-xs text-red-500 mt-1">{errors.termYears}</p>}
                            </Field>
                        </div>

                        <Field>
                            <FieldLabel htmlFor="extra-monthly">
                                Extra Monthly Payment
                                <span className="ml-2 text-xs text-neutral-400 font-normal">(optional)</span>
                            </FieldLabel>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                                <Input id="extra-monthly" type="number" placeholder="0" min={0}
                                    className={`pl-7 ${fieldClass("extraMonthly")}`}
                                    value={values.extraMonthly}
                                    onChange={(e) => handleChange("extraMonthly", e.target.value)}
                                    onBlur={() => handleBlur("extraMonthly")} />
                            </div>
                            {touched.extraMonthly && errors.extraMonthly && <p className="text-xs text-red-500 mt-1">{errors.extraMonthly}</p>}
                        </Field>

                        {apiError && <p className="text-sm text-red-500">{apiError}</p>}
                        <Field orientation="horizontal">
                            <Button type="submit" disabled={loading}>{loading ? "Calculating…" : "Calculate"}</Button>
                            <Button variant="outline" type="button" onClick={handleReset} disabled={loading}>Reset</Button>
                        </Field>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}

export const Calculator = () => {
    const [result, setResult] = useState<MortgageResult | null>(null)

    const [savedLoan, setSavedLoan] = useState<{ housePrice: number; downPayment: number; annualRate: number; termYears: number; extraMonthly: number } | null>(null)

    useEffect(() => {
        getLoan().then((loan) => {
            if (loan) {
                setResult(loan)
                setSavedLoan({
                    housePrice: loan.housePrice,
                    downPayment: loan.downPayment,
                    annualRate: loan.annualRate,
                    termYears: loan.termYears,
                    extraMonthly: loan.extraMonthly,
                })
            }
        }).catch(() => {})
    }, [])

    const formInitialValues = savedLoan ? {
        housePrice: String(savedLoan.housePrice),
        downPayment: String(savedLoan.downPayment),
        annualRate: String(savedLoan.annualRate),
        termYears: String(savedLoan.termYears),
        extraMonthly: String(savedLoan.extraMonthly),
    } : undefined

    return (
        <div className="w-full">
            <div className="flex flex-col gap-4 mt-16 md:mt-2">
                <h1 className="text-4xl font-bold">Calculator</h1>
                <h3 className="text-sm text-neutral-500">Calculate your mortgage payment</h3>
            </div>
            <div className="mt-10 w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-start border border-2 border-dashed border-neutral-200 p-5 rounded-xl">
                <CalculatorForm key={savedLoan ? "loaded" : "empty"} onResult={setResult} initialValues={formInitialValues} />
                {result ? (
                    <ResultPanel result={result} />
                ) : (
                    <div className="border border-2 border-dashed border-neutral-200 p-5 rounded-xl h-full">
                        <div className="hidden md:flex flex-col items-center justify-center h-64 text-neutral-300 gap-3">
                            <p className="text-sm">Fill in the form to see your results</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}