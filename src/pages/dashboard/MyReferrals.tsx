import { Link } from 'react-router-dom';
import { useReferralCommissions } from '@/hooks/useReferrals';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
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
import { ArrowLeft, Users, Copy, TrendingUp, Wallet, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function MyReferrals() {
  const { data: profile } = useProfile();
  const { data: commissions, isLoading } = useReferralCommissions();
  const { toast } = useToast();

  const referralLink = `${window.location.origin}/auth?ref=${profile?.referral_code || ''}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({ title: 'Copied!', description: 'Referral link copied to clipboard' });
  };

  const totalEarnings = commissions?.reduce((sum, c) => sum + c.commission_amount, 0) || 0;
  const pendingEarnings = commissions?.filter(c => !c.is_paid).reduce((sum, c) => sum + c.commission_amount, 0) || 0;

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
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">My Referrals</h1>
          </div>
          <p className="text-muted-foreground">Track your referral earnings and commissions</p>
        </div>

        {/* Referral Link Card - 2026 Titanium Style */}
        <Card className="mb-8 titanium-card cyan-glow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Users className="h-5 w-5 text-primary" />
              Share Your Referral Link
            </CardTitle>
            <CardDescription>
              Earn <span className="text-primary font-semibold">50% commission</span> on every membership purchase from your referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <code className="flex-1 px-4 py-3 bg-background/50 border border-border rounded text-sm font-mono truncate text-muted-foreground">
                {referralLink}
              </code>
              <Button onClick={copyReferralLink} className="gap-2 haptic-press">
                <Copy className="h-4 w-4" /> Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats - 2026 Titanium Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="titanium-card widget-hover">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 text-primary/70" /> Total Referrals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-mono text-glow-cyan">{commissions?.length || 0}</p>
            </CardContent>
          </Card>
          
          <Card className="titanium-card widget-hover">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-primary/70" /> Total Earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-mono text-glow-cyan">
                ₳{totalEarnings.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
          
          <Card className="titanium-card widget-hover">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="h-4 w-4 text-primary/70" /> Pending Payout
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold font-mono text-glow-cyan">
                ₳{pendingEarnings.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Commissions Table - 2026 Obsidian Table */}
        <Card className="titanium-card">
          <CardHeader className="border-b border-border">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Commission History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">Loading commissions...</p>
              </div>
            ) : commissions && commissions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium">Date</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Tier</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Amount</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Commission</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map((commission) => (
                      <TableRow key={commission.id} className="border-border hover:bg-muted/30 transition-colors">
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {commission.created_at 
                            ? format(new Date(commission.created_at), 'MMM dd, yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-primary/30 text-primary font-mono text-xs capitalize">
                            {commission.membership_tier}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          ₳{commission.membership_amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="font-bold font-mono text-emerald-400">
                          +₳{commission.commission_amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {commission.is_paid ? (
                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 gap-1">
                              <CheckCircle className="h-3 w-3" /> Paid
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <Clock className="h-3 w-3" /> Pending
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="p-4 rounded bg-primary/10 border border-primary/20 inline-flex mb-4">
                  <Users className="h-8 w-8 text-primary/60" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Referrals Yet</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Share your referral link to start earning commissions
                </p>
                <Button onClick={copyReferralLink} className="gap-2 haptic-press">
                  <Copy className="h-4 w-4" /> Copy Referral Link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
