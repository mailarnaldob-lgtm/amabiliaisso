/**
 * Network Manager Panel - Admin MLM Control
 * Allows admins to view entire network, adjust ranks, resolve commission disputes
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Users, TrendingUp, Search, Crown, Star, Zap, 
  RefreshCw, Loader2, AlertTriangle, CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface NetworkMember {
  id: string;
  full_name: string;
  membership_tier: 'basic' | 'pro' | 'expert' | 'elite' | null;
  referral_code: string;
  referred_by: string | null;
  created_at: string;
  direct_count: number;
  total_earnings: number;
}

interface NetworkCommission {
  id: string;
  earner_id: string;
  upline_id: string;
  source_type: string;
  base_amount: number;
  commission_amount: number;
  level_depth: number;
  is_credited: boolean;
  created_at: string;
}

const TIER_CONFIG = {
  basic: { name: 'Basic', icon: Users, color: 'text-slate-400', bg: 'bg-slate-500/10' },
  pro: { name: 'PRO', icon: Star, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  expert: { name: 'EXPERT', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  elite: { name: 'ELITE', icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10' },
};

export function NetworkManagerPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<NetworkMember | null>(null);
  const [editTierDialogOpen, setEditTierDialogOpen] = useState(false);
  const [newTier, setNewTier] = useState<string>('');

  // Fetch all network members with stats
  const { data: members, isLoading: membersLoading, refetch } = useQuery({
    queryKey: ['admin-network-members'],
    queryFn: async (): Promise<NetworkMember[]> => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich with stats
      const enriched = await Promise.all(
        (profiles || []).map(async (p) => {
          // Count direct referrals
          const { count: directCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('referred_by', p.id);

          // Sum network earnings
          const { data: earnings } = await supabase
            .from('network_commissions')
            .select('commission_amount')
            .eq('upline_id', p.id)
            .eq('is_credited', true);

          const totalEarnings = earnings?.reduce((sum, e) => sum + Number(e.commission_amount), 0) || 0;

          return {
            id: p.id,
            full_name: p.full_name,
            membership_tier: p.membership_tier,
            referral_code: p.referral_code,
            referred_by: p.referred_by,
            created_at: p.created_at,
            direct_count: directCount || 0,
            total_earnings: totalEarnings,
          } as NetworkMember;
        })
      );

      return enriched;
    },
    staleTime: 30000,
  });

  // Fetch recent network commissions
  const { data: recentCommissions } = useQuery({
    queryKey: ['admin-network-commissions'],
    queryFn: async (): Promise<NetworkCommission[]> => {
      const { data, error } = await supabase
        .from('network_commissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as NetworkCommission[];
    },
    staleTime: 15000,
  });

  // Update member tier mutation
  const updateTierMutation = useMutation({
    mutationFn: async ({ memberId, tier }: { memberId: string; tier: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ membership_tier: tier as any })
        .eq('id', memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Tier Updated', description: 'Member tier has been updated successfully.' });
      queryClient.invalidateQueries({ queryKey: ['admin-network-members'] });
      setEditTierDialogOpen(false);
      setSelectedMember(null);
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    },
  });

  // Filter members by search
  const filteredMembers = (members || []).filter(m =>
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.referral_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats summary
  const totalMembers = members?.length || 0;
  const tierCounts = {
    basic: members?.filter(m => !m.membership_tier || m.membership_tier === 'basic').length || 0,
    pro: members?.filter(m => m.membership_tier === 'pro').length || 0,
    expert: members?.filter(m => m.membership_tier === 'expert').length || 0,
    elite: members?.filter(m => m.membership_tier === 'elite').length || 0,
  };

  const openEditTier = (member: NetworkMember) => {
    setSelectedMember(member);
    setNewTier(member.membership_tier || 'basic');
    setEditTierDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-primary/10 bg-gradient-to-br from-card to-primary/5">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{totalMembers}</p>
            <p className="text-xs text-muted-foreground">Total Members</p>
          </CardContent>
        </Card>
        {Object.entries(tierCounts).map(([tier, count]) => {
          const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG];
          const Icon = config.icon;
          return (
            <Card key={tier} className={`border-${tier === 'elite' ? 'amber' : tier === 'expert' ? 'purple' : tier === 'pro' ? 'blue' : 'slate'}-500/10 bg-gradient-to-br from-card to-${tier}-500/5`}>
              <CardContent className="p-4 text-center">
                <Icon className={`h-6 w-6 mx-auto mb-2 ${config.color}`} />
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground">{config.name}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search & Actions */}
      <Card className="border-primary/10">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Network Members
              </CardTitle>
              <CardDescription>Manage MLM network and tier assignments</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or referral code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {membersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Member</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Referral Code</TableHead>
                    <TableHead>Direct Refs</TableHead>
                    <TableHead>Network Earnings</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.slice(0, 50).map((member) => {
                    const tier = member.membership_tier || 'basic';
                    const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG] || TIER_CONFIG.basic;
                    const Icon = config.icon;
                    return (
                      <TableRow key={member.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{member.full_name}</TableCell>
                        <TableCell>
                          <Badge className={`${config.bg} ${config.color} border-none`}>
                            <Icon className="h-3 w-3 mr-1" />
                            {config.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{member.referral_code}</TableCell>
                        <TableCell>{member.direct_count}</TableCell>
                        <TableCell className="font-mono">₳{member.total_earnings.toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {member.created_at ? format(new Date(member.created_at), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditTier(member)}
                          >
                            Edit Tier
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Commissions */}
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            Recent Network Commissions
          </CardTitle>
          <CardDescription>Last 50 override commissions credited</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Base Amount</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(recentCommissions || []).map((comm) => (
                  <TableRow key={comm.id} className="hover:bg-muted/30">
                    <TableCell className="text-sm text-muted-foreground">
                      {comm.created_at ? format(new Date(comm.created_at), 'MMM dd, HH:mm') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{comm.source_type}</Badge>
                    </TableCell>
                    <TableCell>L{comm.level_depth}</TableCell>
                    <TableCell className="font-mono">₳{comm.base_amount.toLocaleString()}</TableCell>
                    <TableCell className="font-mono text-emerald-500">+₳{comm.commission_amount.toLocaleString()}</TableCell>
                    <TableCell>
                      {comm.is_credited ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none">Credited</Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-500 border-none">Pending</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!recentCommissions || recentCommissions.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No network commissions yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Tier Dialog */}
      <Dialog open={editTierDialogOpen} onOpenChange={setEditTierDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Edit Member Tier
            </DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Member</Label>
                <p className="text-lg font-semibold">{selectedMember.full_name}</p>
                <p className="text-sm text-muted-foreground">Code: {selectedMember.referral_code}</p>
              </div>
              <div>
                <Label>New Tier</Label>
                <Select value={newTier} onValueChange={setNewTier}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (Worker)</SelectItem>
                    <SelectItem value="pro">PRO (Merchant)</SelectItem>
                    <SelectItem value="expert">EXPERT (Broker)</SelectItem>
                    <SelectItem value="elite">ELITE (Banker)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTierDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => selectedMember && updateTierMutation.mutate({ memberId: selectedMember.id, tier: newTier })}
              disabled={updateTierMutation.isPending}
            >
              {updateTierMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
