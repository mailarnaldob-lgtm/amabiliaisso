import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";

// Public pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Alpha App Pages (New 4-App Architecture)
import BankApp from "./pages/alpha/BankApp";
import MarketApp from "./pages/alpha/MarketApp";
import FinanceApp from "./pages/alpha/FinanceApp";
import GrowthApp from "./pages/alpha/GrowthApp";
import SettingsApp from "./pages/alpha/SettingsApp";

// Legacy Member dashboard pages (keeping for backwards compatibility)
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Marketplace from "./pages/Marketplace";
import Swap from "./pages/Swap";
import Profile from "./pages/Profile";
import MemberDashboard from "./pages/dashboard/MemberDashboard";
import UpgradeMembership from "./pages/dashboard/UpgradeMembership";
import MyReferrals from "./pages/dashboard/MyReferrals";
import Transactions from "./pages/dashboard/Transactions";
import MyProfile from "./pages/dashboard/MyProfile";
import MemberSettings from "./pages/dashboard/MemberSettings";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMembers from "./pages/admin/AdminMembers";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminCommissions from "./pages/admin/AdminCommissions";
import GodEyePanel from "./pages/admin/GodEyePanel";
import AdminLogin from "./pages/admin/AdminLogin";
import TaskProofsDashboard from "./pages/admin/TaskProofsDashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* ═══════════════════════════════════════════════════════════════
                ₳LPHA SMART FINANCE - 4 APP ARCHITECTURE
                ═══════════════════════════════════════════════════════════════ */}
            
            {/* App #1: BANK - Wallet & Credits */}
            <Route path="/alpha/bank" element={<ProtectedRoute><BankApp /></ProtectedRoute>} />
            
            {/* App #2: MARKET - VPA Missions */}
            <Route path="/alpha/market" element={<ProtectedRoute><MarketApp /></ProtectedRoute>} />
            
            {/* App #3: FINANCE - P2P Lending */}
            <Route path="/alpha/finance" element={<ProtectedRoute><FinanceApp /></ProtectedRoute>} />
            
            {/* App #4: GROWTH - Royalties & Network */}
            <Route path="/alpha/growth" element={<ProtectedRoute><GrowthApp /></ProtectedRoute>} />
            
            {/* Settings */}
            <Route path="/alpha/settings" element={<ProtectedRoute><SettingsApp /></ProtectedRoute>} />
            
            {/* Alpha redirect - Default to Bank */}
            <Route path="/alpha" element={<Navigate to="/alpha/bank" replace />} />
            
            {/* ═══════════════════════════════════════════════════════════════
                LEGACY ROUTES (Backwards Compatibility)
                ═══════════════════════════════════════════════════════════════ */}
            
            {/* Main App Routes (Legacy Member) */}
            <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/app/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/app/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
            <Route path="/app/swap" element={<ProtectedRoute><Swap /></ProtectedRoute>} />
            <Route path="/app/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/app/settings" element={<ProtectedRoute><MemberSettings /></ProtectedRoute>} />
            
            {/* Legacy Member Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/upgrade" element={<ProtectedRoute><UpgradeMembership /></ProtectedRoute>} />
            <Route path="/dashboard/referrals" element={<ProtectedRoute><MyReferrals /></ProtectedRoute>} />
            <Route path="/dashboard/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><MemberSettings /></ProtectedRoute>} />
            
            {/* ═══════════════════════════════════════════════════════════════
                ADMIN ROUTES
                ═══════════════════════════════════════════════════════════════ */}
            
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/members" element={<ProtectedRoute requireAdmin><AdminMembers /></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute requireAdmin><AdminPayments /></ProtectedRoute>} />
            <Route path="/admin/commissions" element={<ProtectedRoute requireAdmin><AdminCommissions /></ProtectedRoute>} />
            <Route path="/admin/god-eye" element={<ProtectedRoute requireAdmin><GodEyePanel /></ProtectedRoute>} />
            
            {/* Admin Auth Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/task-proofs" element={<ProtectedRoute requireAdmin><TaskProofsDashboard /></ProtectedRoute>} />
            
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
