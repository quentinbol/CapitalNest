import { Route, Routes } from "react-router-dom"
import { Dashboard } from "@/pages/Dashboard"
import { AppLayout } from "@/app/AppLayout"
import { NotFound } from "@/pages/NotFound"
import { Calculator } from "@/pages/Calculator"

export const Router = () => {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    )
}