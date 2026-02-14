import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import DeclareLead from "./pages/DeclareLead";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminSourcing from "./pages/admin/AdminSourcing";
import AdminMissions from "./pages/admin/AdminMissions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/declare" element={<DeclareLead />} />
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/leads" element={<AdminLeads />} />
          <Route path="/admin/sourcing" element={<AdminSourcing />} />
          <Route path="/admin/missions" element={<AdminMissions />} />
          <Route path="/admin/commissions" element={<AdminMissions />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
