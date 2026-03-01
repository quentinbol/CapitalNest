import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "@/app/App"
import { BrowserRouter } from "react-router-dom"
import { TooltipProvider } from "@/components/ui/tooltip"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </BrowserRouter>
  </StrictMode>
)
