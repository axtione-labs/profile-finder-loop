import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CommissionsDashboard from "./pages/CommissionsDashboard";
import DeclareLead from "./pages/DeclareLead";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Settings from "./pages/Settings";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminSourcing from "./pages/admin/AdminSourcing";
import AdminMissions from "./pages/admin/AdminMissions";
import AdminCommissions from "./pages/admin/AdminCommissions";
import AdminClients from "./pages/admin/AdminClients";
import AdminApporteurs from "./pages/admin/AdminApporteurs";
import SignContract from "./pages/SignContract";
import NotFound from "./pages/NotFound";
import MesClients from "./pages/apporteur/MesClients";
import MesContrats from "./pages/apporteur/MesContrats";
import MesCommissions from "./pages/apporteur/MesCommissions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/commissions" element={<ProtectedRoute><CommissionsDashboard /></ProtectedRoute>} />
            <Route path="/declare" element={<ProtectedRoute><DeclareLead /></ProtectedRoute>} />
            <Route path="/sign-contract" element={<ProtectedRoute><SignContract /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminOverview /></ProtectedRoute>} />
            <Route path="/admin/leads" element={<ProtectedRoute requireAdmin><AdminLeads /></ProtectedRoute>} />
            <Route path="/admin/sourcing" element={<ProtectedRoute requireAdmin><AdminSourcing /></ProtectedRoute>} />
            <Route path="/admin/missions" element={<ProtectedRoute requireAdmin><AdminMissions /></ProtectedRoute>} />
            <Route path="/admin/commissions" element={<ProtectedRoute requireAdmin><AdminCommissions /></ProtectedRoute>} />
            <Route path="/admin/clients" element={<ProtectedRoute requireAdmin><AdminClients /></ProtectedRoute>} />
            <Route path="/admin/apporteurs" element={<ProtectedRoute requireAdmin><AdminApporteurs /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
