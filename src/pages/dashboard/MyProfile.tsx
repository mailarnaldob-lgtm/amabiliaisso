import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Mail, Phone, Shield, Crown, Zap, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileSchema } from '@/lib/validations';
import { getTierDisplayLabel, isPaidTier } from '@/lib/tierUtils';

export default function MyProfile() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      toast({ title: 'Profile Updated', description: 'Your profile has been updated successfully.' });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate input using zod schema
    const result = profileSchema.safeParse({ full_name: fullName, phone: phone || '' });
    
    if (!result.success) {
      const fieldErrors: { full_name?: string; phone?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'full_name') fieldErrors.full_name = err.message;
        if (err.path[0] === 'phone') fieldErrors.phone = err.message;
      });
      setErrors(fieldErrors);
      toast({ variant: 'destructive', title: 'Validation Error', description: 'Please fix the errors below.' });
      return;
    }

    setIsSubmitting(true);
    await updateProfile.mutateAsync({ full_name: result.data.full_name, phone: result.data.phone || '' });
    setIsSubmitting(false);
  };

  const getTierIcon = (tier: string | null) => {
    switch (tier) {
      case 'elite': return Crown;
      case 'pro': return Zap;
      default: return Star;
    }
  };

  const TierIcon = getTierIcon(profile?.membership_tier || null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

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

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        {/* Membership Status */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TierIcon className="h-5 w-5 text-primary" />
              Membership Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Badge className="capitalize text-sm px-4 py-1">
                  {getTierDisplayLabel(profile?.membership_tier || null)} Account
                </Badge>
                {profile?.is_kyc_verified && (
                  <Badge variant="outline" className="ml-2">
                    <Shield className="h-3 w-3 mr-1" /> KYC Verified
                  </Badge>
                )}
              </div>
              {profile?.membership_tier !== 'elite' && (
                <Link to="/dashboard/upgrade">
                  <Button variant="outline" size="sm">Upgrade</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    maxLength={200}
                    className={errors.full_name ? 'border-destructive' : ''}
                  />
                </div>
                {errors.full_name && <p className="text-sm text-destructive">{errors.full_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09171234567"
                    maxLength={15}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                </div>
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label>Referral Code</Label>
                <Input value={profile?.referral_code || ''} disabled className="bg-muted font-mono" />
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
