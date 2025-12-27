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
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';
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
  const { data: wallets } = useWallets();

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
    const wallet = wallets?.find(w => w.id === walletId);
    if (!wallet) return 'Unknown';
    return wallet.wallet_type.charAt(0).toUpperCase() + wallet.wallet_type.slice(1) + ' Wallet';
  };

  const taskWallet = wallets?.find(w => w.wallet_type === 'task');
  const royaltyWallet = wallets?.find(w => w.wallet_type === 'royalty');
  const mainWallet = wallets?.find(w => w.wallet_type === 'main');

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Transactions</h1>
          <p className="text-muted-foreground">View your wallet transactions history</p>
        </div>

        {/* Wallet Balances */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Task Wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ₱{(taskWallet?.balance || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Royalty Wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ₱{(royaltyWallet?.balance || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Main Wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ₱{(mainWallet?.balance || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : transactions && transactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        {tx.created_at
                          ? format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {tx.amount >= 0 ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-destructive" />
                          )}
                          <span className="capitalize">{tx.transaction_type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getWalletName(tx.wallet_id)}</Badge>
                      </TableCell>
                      <TableCell>{tx.description || '-'}</TableCell>
                      <TableCell className={`text-right font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                        {tx.amount >= 0 ? '+' : ''}₱{Math.abs(tx.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Transactions Yet</h3>
                <p className="text-muted-foreground">
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
