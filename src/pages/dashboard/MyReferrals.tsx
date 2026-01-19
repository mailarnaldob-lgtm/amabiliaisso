import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
import { ArrowLeft, Users, Copy, TrendingUp } from 'lucide-react';
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
          <h1 className="text-3xl font-bold text-foreground mb-2">My Referrals</h1>
          <p className="text-muted-foreground">Track your referral earnings and commissions</p>
        </div>

        {/* Referral Link Card */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Share Your Referral Link
            </CardTitle>
            <CardDescription>
              Earn 50% commission (₱400) on every ₱800 activation from your referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <code className="flex-1 px-4 py-3 bg-muted rounded-lg text-sm truncate">
                {referralLink}
              </code>
              <Button onClick={copyReferralLink} className="gap-2">
                <Copy className="h-4 w-4" /> Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardDescription>Total Referrals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{commissions?.length || 0}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardDescription>Total Earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                ₱{totalEarnings.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardDescription>Pending Payout</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                ₱{pendingEarnings.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Commissions Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Commission History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : commissions && commissions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>
                        {commission.created_at 
                          ? format(new Date(commission.created_at), 'MMM dd, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="capitalize">
                        <Badge variant="outline">{commission.membership_tier}</Badge>
                      </TableCell>
                      <TableCell>₱{commission.membership_amount.toLocaleString()}</TableCell>
                      <TableCell className="font-medium text-primary">
                        ₱{commission.commission_amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={commission.is_paid ? 'default' : 'secondary'}>
                          {commission.is_paid ? 'Paid' : 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Referrals Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Share your referral link to start earning commissions
                </p>
                <Button onClick={copyReferralLink} className="gap-2">
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
