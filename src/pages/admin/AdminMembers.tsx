import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, CreditCard, LogOut, LayoutDashboard, Search } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

export default function AdminMembers() {
  const { signOut } = useAuth();
  const location = useLocation();
  const [search, setSearch] = useState('');

  const { data: members, isLoading } = useQuery({
    queryKey: ['admin-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredMembers = members?.filter(m =>
    m.full_name.toLowerCase().includes(search.toLowerCase()) ||
    m.referral_code.toLowerCase().includes(search.toLowerCase())
  );

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/members', label: 'Members', icon: Users },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 border-r border-border bg-card p-6">
        <div className="mb-8"><h1 className="text-xl font-bold text-primary">Admin Panel</h1></div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <Button variant={location.pathname === item.href ? 'secondary' : 'ghost'} className="w-full justify-start gap-2">
                <item.icon className="h-4 w-4" />{item.label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="mt-8 pt-8 border-t border-border">
          <Link to="/dashboard"><Button variant="outline" className="w-full mb-2">Back to App</Button></Link>
          <Button variant="ghost" className="w-full gap-2" onClick={() => signOut()}><LogOut className="h-4 w-4" /> Logout</Button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Members</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search members..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <Card className="border-border">
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers?.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.full_name}</TableCell>
                    <TableCell>{member.phone || '-'}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{member.membership_tier || 'basic'}</Badge></TableCell>
                    <TableCell>{member.is_kyc_verified ? <Badge>Verified</Badge> : <Badge variant="secondary">Pending</Badge>}</TableCell>
                    <TableCell className="font-mono">{member.referral_code}</TableCell>
                    <TableCell>{member.created_at ? format(new Date(member.created_at), 'MMM dd, yyyy') : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
