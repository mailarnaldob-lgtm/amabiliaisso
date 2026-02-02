import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  CreditCard, 
  LogOut, 
  LayoutDashboard, 
  Shield, 
  FileCheck,
  Eye,
  Settings,
  DollarSign,
  ArrowLeft,
  Landmark,
  Settings2
} from 'lucide-react';
import { clearAdminSession } from '@/lib/adminSession';

interface AdminSidebarProps {
  adminInfo: { id: string; email: string; role: string } | null;
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/task-proofs', label: 'Activity Proofs', icon: FileCheck },
  { href: '/admin/members', label: 'Members', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/commissions', label: 'Commissions', icon: DollarSign },
  { href: '/admin/loans', label: 'Loan Management', icon: Landmark },
  { href: '/admin/economic', label: 'Economic Controls', icon: Settings2 },
  { href: '/admin/god-eye', label: 'God-Eye Panel', icon: Eye },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar({ adminInfo }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminSession();
    navigate('/');
  };

  return (
    <aside className="w-64 border-r border-primary/10 bg-gradient-to-b from-slate-900 via-slate-900/95 to-background flex flex-col backdrop-blur-xl">
      {/* Header with glassmorphism */}
      <div className="p-6 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
        <Link to="/admin" className="flex items-center gap-3 group">
          <div className="relative">
            <Shield className="h-8 w-8 text-primary transition-all duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <span className="text-xl font-bold text-primary font-mono tracking-tight">COMMAND</span>
            <p className="text-xs text-muted-foreground">Sovereign Control</p>
          </div>
        </Link>
        {adminInfo && (
          <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <p className="text-xs text-muted-foreground">Authenticated as</p>
            <p className="text-sm font-medium text-foreground truncate">{adminInfo.email}</p>
            <Badge variant="outline" className="mt-2 text-xs border-primary/30 text-primary">
              {adminInfo.role}
            </Badge>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.href} to={item.href}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(0,209,255,0.1)]' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-primary/5 border border-transparent'
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </Button>
            </Link>
          );
        })}
      </nav>
      
      {/* Footer Actions */}
      <div className="p-4 border-t border-primary/10 space-y-2 bg-gradient-to-t from-background to-transparent">
        <Link to="/dashboard">
          <Button 
            variant="outline" 
            className="w-full gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="w-full gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200" 
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" /> 
          Logout
        </Button>
      </div>
    </aside>
  );
}
