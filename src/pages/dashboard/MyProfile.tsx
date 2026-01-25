import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { EliteButton } from '@/components/ui/elite-button';
import { 
  ArrowLeft, User, Mail, Phone, Shield, Crown, Zap, Star, 
  Landmark, Target, TrendingUp, Sprout, Copy, LogOut 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileSchema } from '@/lib/validations';
import { toast } from 'sonner';

export default function MyProfile() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { toast: uiToast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ full_name?: string; phone?: string }>({});

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: async (data: { full_name: string; phone: string }) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ full_name: data.full_name, phone: data.phone || null })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      uiToast({ title: 'Profile Updated', description: 'Your profile has been updated successfully.' });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: Error) => {
      uiToast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = profileSchema.safeParse({ full_name: fullName, phone: phone || '' });
    
    if (!result.success) {
      const fieldErrors: { full_name?: string; phone?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'full_name') fieldErrors.full_name = err.message;
        if (err.path[0] === 'phone') fieldErrors.phone = err.message;
      });
      setErrors(fieldErrors);
      uiToast({ variant: 'destructive', title: 'Validation Error', description: 'Please fix the errors below.' });
      return;
    }

    setIsSubmitting(true);
    await updateProfile.mutateAsync({ full_name: result.data.full_name, phone: result.data.phone || '' });
    setIsSubmitting(false);
  };

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast.success('Referral code copied!');
    }
  };

  const getTierIcon = (tier: string | null) => {
    switch (tier) {
      case 'elite': return Crown;
      case 'pro': return Zap;
      default: return Star;
    }
  };

  const TierIcon = getTierIcon(profile?.membership_tier || null);

  // Quick access functions with navigation
  const quickFunctions = [
    { 
      icon: Landmark, 
      label: 'Bank', 
      description: 'Manage your credits',
      path: '/dashboard/bank',
      color: 'from-amber-500 to-orange-600'
    },
    { 
      icon: Target, 
      label: 'Market', 
      description: 'P2P marketplace',
      path: '/dashboard/market',
      color: 'from-blue-500 to-cyan-600'
    },
    { 
      icon: TrendingUp, 
      label: 'Finance', 
      description: 'Lending & borrowing',
      path: '/dashboard/finance',
      color: 'from-purple-500 to-pink-600'
    },
    { 
      icon: Sprout, 
      label: 'Growth', 
      description: 'Tasks & activities',
      path: '/dashboard/growth',
      color: 'from-emerald-500 to-teal-600'
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Profile Header */}
        <div className="text-center py-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 mx-auto mb-4 flex items-center justify-center">
            <TierIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{profile?.full_name || 'Member'}</h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge className="capitalize bg-gradient-to-r from-amber-500 to-orange-600 text-white">
              {profile?.membership_tier || 'basic'} Member
            </Badge>
            {profile?.is_kyc_verified && (
              <Badge variant="outline" className="border-success text-success">
                <Shield className="w-3 h-3 mr-1" /> KYC Verified
              </Badge>
            )}
          </div>
        </div>

        {/* Referral Card */}
        <Card className="border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground mb-2">Your Referral Code</p>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
              <span className="font-mono text-2xl font-bold text-primary">{profile?.referral_code || '------'}</span>
              <Button size="sm" variant="outline" onClick={copyReferralCode}>
                <Copy className="h-4 w-4 mr-1" /> Copy
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Earn 40% commission on every referral!</p>
          </CardContent>
        </Card>

        {/* ═══════════════════════════════════════════════════════════════
            QUICK ACCESS FUNCTIONS - Bank, Market, Finance, Growth
        ═══════════════════════════════════════════════════════════════ */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Quick Access
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickFunctions.map((fn) => (
              <button
                key={fn.path}
                onClick={() => navigate(fn.path)}
                className="titanium-card p-4 text-left hover:border-primary/50 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${fn.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                  <fn.icon className="h-6 w-6 text-white" />
                </div>
                <p className="font-medium text-foreground">{fn.label}</p>
                <p className="text-xs text-muted-foreground">{fn.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Collapsible Profile Form */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-xs">Update your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  maxLength={200}
                  className={errors.full_name ? 'border-destructive' : ''}
                />
                {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09171234567"
                  maxLength={15}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>

              <Button type="submit" size="sm" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Upgrade CTA */}
        {profile?.membership_tier !== 'elite' && (
          <Link to="/dashboard/upgrade">
            <Card className="border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Upgrade Your Access Level</p>
                  <p className="text-sm text-muted-foreground">Unlock more participation opportunities</p>
                </div>
                <EliteButton variant="success" size="sm">
                  <Zap className="h-4 w-4 mr-1" /> Upgrade Now
                </EliteButton>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* Sign Out */}
        <Button 
          variant="outline" 
          className="w-full text-destructive border-destructive/50 hover:bg-destructive/10"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </main>
    </div>
  );
}
