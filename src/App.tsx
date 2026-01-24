import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="space-y-4 w-full max-w-md px-4">
      <Skeleton className="h-8 w-3/4 mx-auto" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);

// Public pages - Lazy loaded
const Landing = lazy(() => import("./pages/Landing"));
const Auth = lazy(() => import("./pages/Auth"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Alpha App Pages (New 4-App Architecture) - Lazy loaded
const BankApp = lazy(() => import("./pages/alpha/BankApp"));
const MarketApp = lazy(() => import("./pages/alpha/MarketApp"));
const FinanceApp = lazy(() => import("./pages/alpha/FinanceApp"));
const GrowthApp = lazy(() => import("./pages/alpha/GrowthApp"));
const SettingsApp = lazy(() => import("./pages/alpha/SettingsApp"));

// Legacy Member dashboard pages - Lazy loaded
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Swap = lazy(() => import("./pages/Swap"));
const Profile = lazy(() => import("./pages/Profile"));
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
            <Suspense fallback={<PageLoader />}>
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
                <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />
                
                {/* Admin Auth Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/task-proofs" element={<ProtectedRoute requireAdmin><TaskProofsDashboard /></ProtectedRoute>} />
                
                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
