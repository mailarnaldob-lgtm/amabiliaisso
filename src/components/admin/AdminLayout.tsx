import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Wallet,
  ClipboardList,
  Settings,
  Eye,
  LogOut 
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/members', label: 'Members', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/admin/commissions', label: 'Commissions', icon: Wallet },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/god-eye', label: 'God Eye', icon: Eye },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
}

export function AdminLayout({ children, title, actions }: AdminLayoutProps) {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 border-r border-border bg-card p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
        </div>
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <Button
                variant={location.pathname === item.href ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="pt-8 border-t border-border space-y-2">
          <Link to="/dashboard">
            <Button variant="outline" className="w-full">Back to App</Button>
          </Link>
          <Button variant="ghost" className="w-full gap-2" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          {actions}
        </div>
        {children}
      </main>
    </div>
  );
}
