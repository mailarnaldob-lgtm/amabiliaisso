import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Public pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Member dashboard pages
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
import MySQLAdminLogin from "./pages/admin/MySQLAdminLogin";
import TaskProofsDashboard from "./pages/admin/TaskProofsDashboard";

const queryClient = new QueryClient();

const App = () => (
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
            
            {/* Main App Routes (Member) */}
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
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/members" element={<ProtectedRoute requireAdmin><AdminMembers /></ProtectedRoute>} />
            <Route path="/admin/payments" element={<ProtectedRoute requireAdmin><AdminPayments /></ProtectedRoute>} />
            <Route path="/admin/commissions" element={<ProtectedRoute requireAdmin><AdminCommissions /></ProtectedRoute>} />
            <Route path="/admin/god-eye" element={<ProtectedRoute requireAdmin><GodEyePanel /></ProtectedRoute>} />
            
            {/* MySQL Admin Routes (separate auth) */}
            <Route path="/admin/login" element={<MySQLAdminLogin />} />
            <Route path="/admin/task-proofs" element={<TaskProofsDashboard />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
