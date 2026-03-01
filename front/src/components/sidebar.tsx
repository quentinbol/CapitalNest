import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CalculatorIcon, ChevronLeftIcon, ChevronRightIcon, HomeIcon, MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
    { icon: <HomeIcon className="w-4 h-4" />, label: "Dashboard", path: "/" },
    { icon: <CalculatorIcon className="w-4 h-4" />, label: "Calculator", path: "/calculator" }
];

type SidebarProps = {
    isExpanded?: boolean;
    onToggleExpand?: (expanded: boolean) => void;
};

export const Sidebar = ({ isExpanded = false, onToggleExpand }: SidebarProps) => {

    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const toggleSidebar = () => onToggleExpand?.(!isExpanded);
    const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

    return (
        <>
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center h-14 px-4 bg-neutral-50 border-b border-neutral-200">
                <Button variant="ghost" size="icon" onClick={toggleMobile}>
                    {isMobileOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
                </Button>
                <p className="ml-3 text-lg font-medium">CapitalNest</p>
            </div>

            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/30"
                    onClick={toggleMobile}
                />
            )}

            <aside className={`
                md:hidden fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 bg-neutral-50 border-r border-neutral-200 p-4
                transform transition-transform duration-200
                ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <div className="flex flex-col gap-12 mt-6">
                    <SidebarSection title="Menu" isExpanded={true}>
                        <div className="flex flex-col gap-2">
                            {navItems.map((item) => (
                                <SidebarItem
                                    key={item.path}
                                    icon={item.icon}
                                    label={item.label}
                                    path={item.path}
                                    isExpanded={true}
                                    onNavigate={toggleMobile}
                                />
                            ))}
                        </div>
                    </SidebarSection>
                </div>
            </aside>

            <aside className={`
                hidden md:flex flex-col gap-4
                fixed top-0 left-0 bottom-0 z-30
                bg-neutral-50 border-r border-neutral-200 p-4
                transition-all duration-200
                ${isExpanded ? "w-56" : "w-16"}
            `}>
                <div className="flex items-center justify-between w-full">
                    <div className="overflow-hidden">
                        {isExpanded && <p className="text-lg whitespace-nowrap">CapitalNest</p>}
                    </div>
                    <Button onClick={toggleSidebar} variant="ghost" size="icon">
                        {isExpanded ? <ChevronLeftIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                    </Button>
                </div>
                <div className="flex flex-col gap-12 mt-24">
                    <SidebarSection title="Menu" isExpanded={isExpanded}>
                        <div className="flex flex-col gap-2">
                            {navItems.map((item) => (
                                <SidebarItem
                                    key={item.path}
                                    icon={item.icon}
                                    label={item.label}
                                    path={item.path}
                                    isExpanded={isExpanded}
                                />
                            ))}
                        </div>
                    </SidebarSection>
                </div>
            </aside>
        </>
    )
}

const SidebarSection = ({ title, children, isExpanded }: { title: string, children: React.ReactNode, isExpanded: boolean }) => {
    return (
        <div className="flex flex-col gap-4">
            {isExpanded && (
                <p className="text-sm text-neutral-500">{title}</p>
            )}
            {children}
        </div>
    )
}

const SidebarItem = ({
    icon,
    label,
    path,
    isExpanded,
    onNavigate,
}: {
    icon: React.ReactNode;
    label: string;
    path: string;
    isExpanded: boolean;
    onNavigate?: () => void;
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isActive = location.pathname === path;

    const handleClick = () => {
        navigate(path);
        onNavigate?.();
    };

    return (
        <div
            onClick={handleClick}
            className={`
                flex items-center gap-2 w-full rounded-md p-1 cursor-pointer transition-colors
                ${isExpanded ? "justify-start" : "justify-center"}
                ${isActive
                    ? "bg-neutral-900 text-white hover:bg-neutral-800"
                    : "hover:bg-neutral-100 text-neutral-700"
                }
            `}
        >
            <Tooltip>
                <TooltipTrigger>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`pointer-events-none ${isActive ? "text-white hover:bg-transparent hover:text-white" : ""}`}
                    >
                        {icon}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                    {label}
                </TooltipContent>
            </Tooltip>
            {isExpanded && (
                <p className={`text-sm font-medium ${isActive ? "text-white" : ""}`}>{label}</p>
            )}
        </div>
    )
}