import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWallets } from '@/hooks/useWallets';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Wallet, Activity, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  transaction_type: string;
  amount: number;
  description: string | null;
  reference_id: string | null;
  created_at: string | null;
}

export default function Transactions() {
  const { user } = useAuth();
  const { wallets } = useWallets();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['wallet-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WalletTransaction[];
    },
    enabled: !!user,
  });

  const getWalletName = (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return 'Unknown';
    return wallet.wallet_type.charAt(0).toUpperCase() + wallet.wallet_type.slice(1);
  };

  const taskWallet = wallets.find(w => w.wallet_type === 'task');
  const royaltyWallet = wallets.find(w => w.wallet_type === 'royalty');
  const mainWallet = wallets.find(w => w.wallet_type === 'main');

  return (
    <div className="min-h-screen bg-background relative">
      {/* 2026 Background Atmosphere */}
      <div className="bg-atmosphere" />
      
      {/* Header - 2026 Obsidian with Glassmorphism */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        {/* Page Header - 2026 Style */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded bg-primary/10 border border-primary/20 cyan-glow-sm">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Transactions</h1>
          </div>
          <p className="text-muted-foreground">View your wallet transactions history</p>
        </div>

        {/* Wallet Balances - 2026 Titanium Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="titanium-card widget-hover">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="h-4 w-4 text-primary/70" /> Task Wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-mono text-glow-cyan">
                ₳{(taskWallet?.balance || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card className="titanium-card widget-hover">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-primary/70" /> Royalty Wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-mono text-glow-cyan">
                ₳{(royaltyWallet?.balance || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card className="titanium-card widget-hover">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="h-4 w-4 text-primary/70" /> Main Wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold font-mono text-glow-cyan">
                ₳{(mainWallet?.balance || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table - 2026 Obsidian Table */}
        <Card className="titanium-card">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">Loading transactions...</p>
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium">Date</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Type</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Wallet</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Description</TableHead>
                      <TableHead className="text-right text-muted-foreground font-medium">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id} className="border-border hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {tx.created_at
                            ? format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {tx.amount >= 0 ? (
                              <div className="p-1 rounded bg-emerald-500/10 border border-emerald-500/20">
                                <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" />
                              </div>
                            ) : (
                              <div className="p-1 rounded bg-destructive/10 border border-destructive/20">
                                <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />
                              </div>
                            )}
                            <span className="capitalize text-sm">{tx.transaction_type.replace(/_/g, ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-primary/30 text-primary font-mono text-xs">
                            {getWalletName(tx.wallet_id)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                          {tx.description || '-'}
                        </TableCell>
                        <TableCell className={`text-right font-bold font-mono ${tx.amount >= 0 ? 'text-emerald-400' : 'text-destructive'}`}>
                          {tx.amount >= 0 ? '+' : ''}₳{Math.abs(tx.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="p-4 rounded bg-primary/10 border border-primary/20 inline-flex mb-4">
                  <Wallet className="h-8 w-8 text-primary/60" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
                <p className="text-muted-foreground text-sm">
                  Your transaction history will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
