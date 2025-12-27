import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Wallet,
  LogOut 
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/members', label: 'Members', icon: Users },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/commissions', label: 'Commissions', icon: Wallet },
];

export function AdminSidebar() {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
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
  );
}
