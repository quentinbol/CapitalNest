import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Chart as ChartJS,
    type Chart,
    type ChartEvent,
    type LegendItem,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    BarElement,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { getLoan } from "@/api/mortgage";
import type { LoanData } from "../../../shared/contractType";
import { BarChart, Calendar, DollarSign, Scale } from "lucide-react";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    BarElement,
);

const defaultBalanceData = [
    { year: 0, balance: 100000 },
    { year: 5, balance: 85000 },
    { year: 10, balance: 65000 },
    { year: 15, balance: 40000 },
    { year: 20, balance: 0 },
];

const defaultInterestPrincipalData = [
    { year: 0, cumulativePrincipal: 0, cumulativeInterest: 0 },
    { year: 5, cumulativePrincipal: 15000, cumulativeInterest: 25000 },
    { year: 10, cumulativePrincipal: 35000, cumulativeInterest: 45000 },
    { year: 15, cumulativePrincipal: 60000, cumulativeInterest: 55000 },
    { year: 20, cumulativePrincipal: 100000, cumulativeInterest: 60000 },
];

const chartOptions = {
    maintainAspectRatio: false,
    scales: {
        x: {
            grid: { display: false },
            ticks: { font: { size: 11 } },
            border: { display: false },
        },
        y: {
            grid: { display: true },
            ticks: { padding: 20, font: { size: 11 }, maxTicksLimit: 5 },
            border: { display: false },
        },
    },
    plugins: { legend: { display: false } },
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value);

const BalanceChart = ({ schedule }: { schedule: { year: number; balance: number }[] }) => {
    const chartData = {
        labels: schedule.map((item) => `Y${item.year}`),
        datasets: [
            {
                label: "Balance",
                data: schedule.map((item) => item.balance),
                borderColor: "rgb(0, 0, 0)",
            },
        ],
    }
    return <Line data={chartData} options={chartOptions} />
}

const InterestPrincipalChart = ({ schedule }: { schedule: { year: number; cumulativePrincipal: number; cumulativeInterest: number }[] }) => {
    const chartData = {
        labels: schedule.map((item) => `Y${item.year}`),
        datasets: [
            {
                label: "Cumulative Principal",
                data: schedule.map((item) => item.cumulativePrincipal),
                borderColor: "rgb(0, 0, 0)",
                backgroundColor: "rgba(34, 197, 94, 0.1)",
            },
            {
                label: "Cumulative Interest",
                data: schedule.map((item) => item.cumulativeInterest),
                borderColor: "rgba(143, 143, 143, 0.56)",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
            },
        ],
    }
    const options = {
        ...chartOptions,
        plugins: {
            legend: {
              display: true,
              position: "bottom" as const,
              align: "center" as const,
              labels: {
                boxWidth: 20,
                boxHeight: 20,
                padding: 15,
                usePointStyle: true,
                pointStyle: "circle" as const,
                font: {
                  size: 10,
                  family: "'Inter', sans-serif",
                },
                color: '#666',
                generateLabels: (chart: Chart<"line">) => {
                  const datasets = chart.data.datasets;
                  return datasets.map((dataset, i): LegendItem => ({
                    text: dataset.label ?? "",
                    fillStyle: typeof dataset.borderColor === "string" ? dataset.borderColor : undefined,
                    strokeStyle: typeof dataset.borderColor === "string" ? dataset.borderColor : undefined,
                        lineWidth: 2,
                    hidden: !chart.isDatasetVisible(i),
                    index: i,
                  }));
                },
              },
              onClick: (_e: ChartEvent, legendItem: LegendItem, legend: { chart: Chart<"line"> }) => {
                const index = legendItem.index;
                const chart = legend.chart;
                chart.setDatasetVisibility(index!, !chart.isDatasetVisible(index!));
                chart.update();
              },
            },
          },
    }
    return <Line data={chartData} options={options} />
}

const MiniSummary = ({ loan }: { loan: LoanData | null }) => {
    const items = loan
        ? [
            { label: "Loan Amount", value: formatCurrency(loan.loanAmount), icon: <DollarSign className="w-4 h-4" />, sub: "Initial amount" },
            { label: "Rate", value: `${loan.annualRate}%`, icon: <BarChart className="w-4 h-4" />, sub: "Annual percentage rate" },
            { label: "Term", value: `${loan.termYears} years`, icon: <Calendar className="w-4 h-4" />, sub: `${loan.termYears * 12} monthly payments` },
            { label: "Total Cost Ratio", value: `${(loan.totalPaid / loan.loanAmount).toFixed(2)}×`, icon: <Scale className="w-4 h-4" />, sub: "Total cost ratio" },
        ]
        : [
            { label: "Loan Amount", value: "—", icon: <DollarSign className="w-4 h-4" />, sub: "Calculate to see" },
            { label: "Rate", value: "—", icon: <BarChart className="w-4 h-4" />, sub: "Annual percentage rate" },
            { label: "Term", value: "—", icon: <Calendar className="w-4 h-4" />, sub: "Monthly payments" },
            { label: "Total Cost Ratio", value: "—", icon: <Scale className="w-4 h-4" />, sub: "Total cost ratio" },
        ];

    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">Mini Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {items.map((item) => (
                        <div key={item.label} className="flex flex-col gap-1 p-3 rounded-lg bg-neutral-50 border border-neutral-100">
                            <span className="text-xl">{item.icon}</span>
                            <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide mt-1">{item.label}</p>
                            <p className="text-xl font-bold text-neutral-900">{item.value}</p>
                            <p className="text-xs text-neutral-400">{item.sub}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export const Dashboard = () => {
    const [loan, setLoan] = useState<LoanData | null>(null);

    useEffect(() => {
        getLoan().then(setLoan).catch(() => {});
    }, []);

    const balanceSchedule = loan?.amortizationSchedule ?? defaultBalanceData;
    const interestPrincipalSchedule =
        loan?.amortizationSchedule?.every((p) => "cumulativePrincipal" in p && "cumulativeInterest" in p)
            ? (loan.amortizationSchedule as { year: number; cumulativePrincipal: number; cumulativeInterest: number }[])
            : defaultInterestPrincipalData;

    return (
        <div>
            <div className="flex flex-col gap-4 mt-16 md:mt-0">
                <h2 className="text-lg font-medium">{new Date().toLocaleDateString()}</h2>
                <div>
                    <h1 className="text-4xl font-bold">Dashboard</h1>
                    <h3 className="text-sm text-neutral-500">Welcome back,</h3>
                </div>
            </div>
            <div className="flex mt-10 w-full gap-4 lg:flex-row flex-col">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Monthly Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{loan ? formatCurrency(loan.monthlyPayment) : "—"}</p>
                        <p className="text-sm text-neutral-500">Monthly payment for the loan</p>
                    </CardContent>
                </Card>
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Total Interest</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{loan ? formatCurrency(loan.totalInterest) : "—"}</p>
                        <p className="text-sm text-neutral-500">Total interest for the loan</p>
                    </CardContent>
                </Card>
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Total Paid</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{loan ? formatCurrency(loan.totalPaid) : "—"}</p>
                        <p className="text-sm text-neutral-500">Total paid for the loan</p>
                    </CardContent>
                </Card>
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Loan End Date</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{loan?.loanEndDate ?? "—"}</p>
                        <p className="text-sm text-neutral-500">Date when the loan will be paid off</p>
                    </CardContent>
                </Card>
            </div>
            <div className="mt-4">
                <MiniSummary loan={loan} />
            </div>

            <div className="flex mt-4 gap-4 flex-wrap">
                <Card className="flex-1 min-w-[300px]">
                    <CardHeader>
                        <CardTitle>Remaining Balance</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <BalanceChart schedule={balanceSchedule} />
                    </CardContent>
                </Card>
                <Card className="flex-1 min-w-[300px]">
                    <CardHeader>
                        <CardTitle>Interest vs Principal (cumulative)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <InterestPrincipalChart schedule={interestPrincipalSchedule} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}