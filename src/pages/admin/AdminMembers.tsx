import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Search, Loader2, Shield, Crown, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';

export default function AdminMembers() {
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

  const getTierIcon = (tier: string | null) => {
    switch (tier) {
      case 'elite': return <Crown className="h-3 w-3" />;
      case 'pro': return <Shield className="h-3 w-3" />;
      default: return <UserCheck className="h-3 w-3" />;
    }
  };

  const getTierClass = (tier: string | null) => {
    switch (tier) {
      case 'elite': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'pro': return 'bg-primary/10 text-primary border-primary/30';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  return (
    <AdminPageWrapper 
      title="MEMBER REGISTRY" 
      description="View and manage all registered members"
    >
      {() => (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search members by name or referral code..." 
              className="pl-10 bg-card/50 border-primary/10 focus:border-primary/30 transition-colors" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>

          {/* Members Table */}
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-mono">
                <Users className="h-5 w-5 text-primary" />
                All Members 
                <Badge variant="outline" className="ml-2 border-primary/30 text-primary">
                  {filteredMembers?.length || 0}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="rounded-lg border border-primary/10 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-primary/5 hover:bg-primary/5">
                        <TableHead className="text-muted-foreground font-mono">Name</TableHead>
                        <TableHead className="text-muted-foreground font-mono">Phone</TableHead>
                        <TableHead className="text-muted-foreground font-mono">Tier</TableHead>
                        <TableHead className="text-muted-foreground font-mono">KYC</TableHead>
                        <TableHead className="text-muted-foreground font-mono">Referral Code</TableHead>
                        <TableHead className="text-muted-foreground font-mono">Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMembers?.map((member) => (
                        <TableRow 
                          key={member.id} 
                          className="border-primary/5 hover:bg-primary/5 transition-colors"
                        >
                          <TableCell className="font-medium text-foreground">{member.full_name}</TableCell>
                          <TableCell className="text-muted-foreground font-mono text-sm">
                            {member.phone || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`capitalize flex items-center gap-1 w-fit ${getTierClass(member.membership_tier)}`}
                            >
                              {getTierIcon(member.membership_tier)}
                              {member.membership_tier || 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {member.is_kyc_verified ? (
                              <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground border-muted">
                                Pending
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-primary text-sm">
                            {member.referral_code}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {member.created_at ? format(new Date(member.created_at), 'MMM dd, yyyy') : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </AdminPageWrapper>
  );
}
