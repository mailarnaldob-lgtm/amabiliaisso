/**
 * ADMIN VAULT MANAGER PANEL - SOVEREIGN V11.0
 * Total liquidity monitoring and manual override controls
 * 
 * Features:
 * - System-wide vault liquidity view
 * - Per-user vault inspection
 * - Manual credit/debit tools
 * - Withdrawal lock/unlock toggles
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Vault, Shield, Lock, Unlock, AlertTriangle, 
  TrendingUp, Users, RefreshCw, Search, Eye,
  ArrowDownToLine, ArrowUpFromLine, Coins, Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatAlpha, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlphaLoader } from '@/components/ui/AlphaLoader';
import { toast } from '@/hooks/use-toast';

interface VaultRecord {
  id: string;
  user_id: string;
  total_balance: number;
  frozen_collateral: number;
  available_balance: number;
  is_active: boolean;
  last_yield_accrual: string | null;
  created_at: string;
  user_name?: string;
  user_email?: string;
}

interface VaultStats {
  totalVaults: number;
  activeVaults: number;
  totalLiquidity: number;
  totalFrozen: number;
  totalYieldDistributed: number;
}

export function VaultManagerPanel() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVault, setSelectedVault] = useState<VaultRecord | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');

  // Fetch all vaults with user info
  const { data: vaults = [], isLoading: loadingVaults, refetch: refetchVaults } = useQuery({
    queryKey: ['admin-vaults'],
    queryFn: async (): Promise<VaultRecord[]> => {
      const { data, error } = await supabase
        .from('elite_vaults')
        .select('*')
        .order('total_balance', { ascending: false });

      if (error) throw error;

      // Fetch user profiles
      const userIds = data?.map(v => v.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      return (data || []).map(v => ({
        id: v.id,
        user_id: v.user_id,
        total_balance: Number(v.total_balance) || 0,
        frozen_collateral: Number(v.frozen_collateral) || 0,
        available_balance: Number(v.available_balance) || 0,
        is_active: v.is_active ?? true,
        last_yield_accrual: v.last_yield_accrual,
        created_at: v.created_at || '',
        user_name: profileMap.get(v.user_id) || 'Unknown',
      }));
    },
    refetchInterval: 30000,
  });

  // Calculate stats
  const stats: VaultStats = {
    totalVaults: vaults.length,
    activeVaults: vaults.filter(v => v.is_active).length,
    totalLiquidity: vaults.reduce((sum, v) => sum + v.total_balance, 0),
    totalFrozen: vaults.reduce((sum, v) => sum + v.frozen_collateral, 0),
    totalYieldDistributed: 0, // Would need separate query for vault_transactions
  };

  // Fetch yield history
  const { data: yieldStats } = useQuery({
    queryKey: ['admin-vault-yield-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vault_transactions')
        .select('amount')
        .eq('transaction_type', 'yield');

      if (error) return { totalYield: 0 };

      const totalYield = (data || []).reduce((sum, tx) => sum + Number(tx.amount), 0);
      return { totalYield };
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetchVaults();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Filter vaults by search
  const filteredVaults = vaults.filter(v => 
    v.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle vault active status
  const toggleVaultMutation = useMutation({
    mutationFn: async ({ vaultId, isActive }: { vaultId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('elite_vaults')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', vaultId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Vault status updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-vaults'] });
    },
    onError: (error: Error) => {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center">
            <Vault className="h-6 w-6 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Vault Manager</h2>
            <p className="text-sm text-muted-foreground">System Liquidity & Elite Vault Controls</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-card border-[#FFD700]/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-[#FFD700]" />
              <span className="text-xs text-muted-foreground">Total Vaults</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.totalVaults}</p>
            <p className="text-xs text-muted-foreground">{stats.activeVaults} active</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-emerald-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-muted-foreground">Total Liquidity</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400 font-mono">₳{formatAlpha(stats.totalLiquidity)}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-blue-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-muted-foreground">Frozen Collateral</span>
            </div>
            <p className="text-2xl font-bold text-blue-400 font-mono">₳{formatAlpha(stats.totalFrozen)}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-[#FFD700]/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-[#FFD700]" />
              <span className="text-xs text-muted-foreground">Yield Distributed</span>
            </div>
            <p className="text-2xl font-bold text-[#FFD700] font-mono">₳{formatAlpha(yieldStats?.totalYield || 0)}</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-purple-500/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-muted-foreground">Daily Rate</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">1%</p>
            <p className="text-xs text-muted-foreground">Per day</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline" className="text-muted-foreground">
          {filteredVaults.length} vaults
        </Badge>
      </div>

      {/* Vaults Table */}
      {loadingVaults ? (
        <div className="flex items-center justify-center h-48">
          <AlphaLoader size="md" />
        </div>
      ) : (
        <Card className="border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Total Balance</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Frozen</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVaults.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No vaults found
                  </TableCell>
                </TableRow>
              ) : (
                filteredVaults.map((vault) => (
                  <TableRow key={vault.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{vault.user_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {vault.user_id.slice(0, 8)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono font-bold text-[#FFD700]">
                        ₳{formatAlpha(vault.total_balance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-emerald-400">
                        ₳{formatAlpha(vault.available_balance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-blue-400">
                        ₳{formatAlpha(vault.frozen_collateral)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          vault.is_active 
                            ? "border-emerald-500/30 text-emerald-400" 
                            : "border-red-500/30 text-red-400"
                        )}
                      >
                        {vault.is_active ? 'Active' : 'Locked'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedVault(vault)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Vault Details: {vault.user_name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 rounded-lg bg-muted/30">
                                  <p className="text-xs text-muted-foreground">Total Balance</p>
                                  <p className="text-lg font-bold text-[#FFD700] font-mono">
                                    ₳{formatAlpha(vault.total_balance)}
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/30">
                                  <p className="text-xs text-muted-foreground">Available</p>
                                  <p className="text-lg font-bold text-emerald-400 font-mono">
                                    ₳{formatAlpha(vault.available_balance)}
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/30">
                                  <p className="text-xs text-muted-foreground">Frozen</p>
                                  <p className="text-lg font-bold text-blue-400 font-mono">
                                    ₳{formatAlpha(vault.frozen_collateral)}
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/30">
                                  <p className="text-xs text-muted-foreground">Last Yield</p>
                                  <p className="text-sm font-medium">
                                    {vault.last_yield_accrual 
                                      ? new Date(vault.last_yield_accrual).toLocaleDateString() 
                                      : 'Never'}
                                  </p>
                                </div>
                              </div>
                              <div className="p-3 rounded-lg bg-muted/20 border border-border">
                                <p className="text-xs text-muted-foreground mb-1">User ID</p>
                                <p className="font-mono text-xs break-all">{vault.user_id}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVaultMutation.mutate({ 
                            vaultId: vault.id, 
                            isActive: !vault.is_active 
                          })}
                          className={vault.is_active ? 'text-red-400' : 'text-emerald-400'}
                        >
                          {vault.is_active ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Info Footer */}
      <Card className="bg-muted/20 border-[#FFD700]/10">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-[#FFD700] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">Vault Management Protocol</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Lock/Unlock:</strong> Locking a vault prevents all deposits and withdrawals. 
                Interest continues to accrue on locked vaults.
                <br/><br/>
                <strong>28-Day Insurance:</strong> Frozen collateral backs active P2P loans. 
                Auto-liquidation occurs on day 28 if unpaid.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
