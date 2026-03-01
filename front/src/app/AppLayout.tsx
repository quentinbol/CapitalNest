import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/sidebar"

export const AppLayout = () => {
    const [sidebarExpanded, setSidebarExpanded] = useState(false)
    return (
        <div className="flex min-h-screen overflow-hidden w-full">
            <Sidebar isExpanded={sidebarExpanded} onToggleExpand={setSidebarExpanded} />
            <div className={`hidden md:block shrink-0 transition-all duration-200 ${sidebarExpanded ? "w-56" : "w-16"}`} aria-hidden />
            <main className="flex-1 min-w-0 overflow-auto p-4">
                <Outlet />
            </main>
        </div>
    )
}