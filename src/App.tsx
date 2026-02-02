import { lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { AlphaSuspenseBoundary } from "@/components/ui/AlphaSuspenseBoundary";

// Public pages - Lazy loaded
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

// ₳LPHA SMART FINANCE - 4 App Architecture (now under /dashboard)
const BankApp = lazy(() => import("./pages/alpha/BankApp"));
const MarketApp = lazy(() => import("./pages/alpha/MarketApp"));
const FinanceApp = lazy(() => import("./pages/alpha/FinanceApp"));
const GrowthApp = lazy(() => import("./pages/alpha/GrowthApp"));
const SettingsApp = lazy(() => import("./pages/alpha/SettingsApp"));
const AdsApp = lazy(() => import("./pages/alpha/AdsApp"));

// Member dashboard pages - Lazy loaded
const MemberDashboard = lazy(() => import("./pages/dashboard/MemberDashboard"));
const UpgradeMembership = lazy(() => import("./pages/dashboard/UpgradeMembership"));
const MyReferrals = lazy(() => import("./pages/dashboard/MyReferrals"));
const Transactions = lazy(() => import("./pages/dashboard/Transactions"));
const MyProfile = lazy(() => import("./pages/dashboard/MyProfile"));
const MemberSettings = lazy(() => import("./pages/dashboard/MemberSettings"));

// Admin pages - Lazy loaded
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminMembers = lazy(() => import("./pages/admin/AdminMembers"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminCommissions = lazy(() => import("./pages/admin/AdminCommissions"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const GodEyePanel = lazy(() => import("./pages/admin/GodEyePanel"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const TaskProofsDashboard = lazy(() => import("./pages/admin/TaskProofsDashboard"));

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
            <AlphaSuspenseBoundary message="LOADING SOVEREIGN INTERFACE">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* ═══════════════════════════════════════════════════════════════
                    ₳LPHA SMART FINANCE - UNIFIED DASHBOARD
                    All apps now live under /dashboard/*
                    ═══════════════════════════════════════════════════════════════ */}
                
                {/* Dashboard Home - Member Overview */}
                <Route path="/dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
                
                {/* App #1: BANK - Wallet & Credits */}
                <Route path="/dashboard/bank" element={<ProtectedRoute><BankApp /></ProtectedRoute>} />
                
                {/* App #2: MARKET - VPA Missions */}
                <Route path="/dashboard/market" element={<ProtectedRoute><MarketApp /></ProtectedRoute>} />
                
                {/* App #3: FINANCE - P2P Lending */}
                <Route path="/dashboard/finance" element={<ProtectedRoute><FinanceApp /></ProtectedRoute>} />
                
                {/* App #4: GROWTH - Royalties & Network */}
                <Route path="/dashboard/growth" element={<ProtectedRoute><GrowthApp /></ProtectedRoute>} />
                
                {/* App #5: ADS - Ad Wizard (PRO+) */}
                <Route path="/dashboard/ads" element={<ProtectedRoute><AdsApp /></ProtectedRoute>} />
                
                {/* Settings */}
                <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsApp /></ProtectedRoute>} />
                
                {/* Member Dashboard Sub-Pages */}
                <Route path="/dashboard/upgrade" element={<ProtectedRoute><UpgradeMembership /></ProtectedRoute>} />
                <Route path="/dashboard/referrals" element={<ProtectedRoute><MyReferrals /></ProtectedRoute>} />
                <Route path="/dashboard/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
                <Route path="/dashboard/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
                
                {/* ═══════════════════════════════════════════════════════════════
                    LEGACY REDIRECTS (Backwards Compatibility)
                    ═══════════════════════════════════════════════════════════════ */}
                
                {/* Redirect old /alpha/* routes to /dashboard/* */}
                <Route path="/alpha" element={<Navigate to="/dashboard/bank" replace />} />
                <Route path="/alpha/bank" element={<Navigate to="/dashboard/bank" replace />} />
                <Route path="/alpha/market" element={<Navigate to="/dashboard/market" replace />} />
                <Route path="/alpha/finance" element={<Navigate to="/dashboard/finance" replace />} />
                <Route path="/alpha/growth" element={<Navigate to="/dashboard/growth" replace />} />
                <Route path="/alpha/settings" element={<Navigate to="/dashboard/settings" replace />} />
                
                {/* Redirect old /app/* routes to /dashboard/* */}
                <Route path="/app" element={<Navigate to="/dashboard" replace />} />
                <Route path="/app/tasks" element={<Navigate to="/dashboard/market" replace />} />
                <Route path="/app/marketplace" element={<Navigate to="/dashboard/bank" replace />} />
                <Route path="/app/swap" element={<Navigate to="/dashboard/bank" replace />} />
                <Route path="/app/profile" element={<Navigate to="/dashboard/profile" replace />} />
                <Route path="/app/settings" element={<Navigate to="/dashboard/settings" replace />} />
                
                {/* ═══════════════════════════════════════════════════════════════
                    ADMIN ROUTES
                    ═══════════════════════════════════════════════════════════════ */}
                
                <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/members" element={<ProtectedRoute requireAdmin><AdminMembers /></ProtectedRoute>} />
                <Route path="/admin/payments" element={<ProtectedRoute requireAdmin><AdminPayments /></ProtectedRoute>} />
                <Route path="/admin/commissions" element={<ProtectedRoute requireAdmin><AdminCommissions /></ProtectedRoute>} />
                <Route path="/admin/god-eye" element={<ProtectedRoute requireAdmin><GodEyePanel /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />
                
                {/* Admin Auth Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/task-proofs" element={<ProtectedRoute requireAdmin><TaskProofsDashboard /></ProtectedRoute>} />
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AlphaSuspenseBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;