import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Users, Wallet, Shield, Info, CreditCard, Check, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Password strength validation
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  hasUppercase: /[A-Z]/,
  hasLowercase: /[a-z]/,
  hasNumber: /[0-9]/
};
interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  requirements: {
    met: boolean;
    label: string;
  }[];
}
function validatePasswordStrength(password: string): PasswordStrength {
  const requirements = [{
    met: password.length >= PASSWORD_REQUIREMENTS.minLength,
    label: 'At least 8 characters'
  }, {
    met: PASSWORD_REQUIREMENTS.hasUppercase.test(password),
    label: 'One uppercase letter'
  }, {
    met: PASSWORD_REQUIREMENTS.hasLowercase.test(password),
    label: 'One lowercase letter'
  }, {
    met: PASSWORD_REQUIREMENTS.hasNumber.test(password),
    label: 'One number'
  }];
  const metCount = requirements.filter(r => r.met).length;
  const score = metCount / requirements.length * 100;
  let label = 'Weak';
  let color = 'text-destructive';
  if (score >= 100) {
    label = 'Strong';
    color = 'text-success';
  } else if (score >= 75) {
    label = 'Good';
    color = 'text-warning';
  } else if (score >= 50) {
    label = 'Fair';
    color = 'text-warning';
  }
  return {
    score,
    label,
    color,
    requirements
  };
}
export default function Auth() {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupReferralCode, setSignupReferralCode] = useState(referralCode);
  const {
    signIn,
    signUp,
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

  // Password strength indicator
  const passwordStrength = useMemo(() => validatePasswordStrength(signupPassword), [signupPassword]);
  const isPasswordValid = passwordStrength.score >= 100;

  // Zero-latency redirect for authenticated users
  useEffect(() => {
    if (user) {
      // Immediate redirect to Sovereign Dashboard
      navigate('/dashboard', {
        replace: true
      });
    }
  }, [user, navigate]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const {
      error
    } = await signIn(loginEmail, loginPassword);
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message === 'Invalid login credentials' ? 'Invalid email or password. Please try again.' : error.message
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.'
      });
      // Zero-latency navigation to Sovereign Dashboard
      navigate('/dashboard', {
        replace: true
      });
    }
    setIsLoading(false);
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Strong password validation
    if (!isPasswordValid) {
      toast({
        variant: 'destructive',
        title: 'Password Too Weak',
        description: 'Password must be at least 8 characters with uppercase, lowercase, and a number.'
      });
      setIsLoading(false);
      return;
    }
    const {
      error
    } = await signUp(signupEmail, signupPassword, signupFullName, signupPhone, signupReferralCode);
    if (error) {
      let message = error.message;
      if (message.includes('already registered')) {
        message = 'This email is already registered. Please login instead.';
      }
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: message
      });
    } else {
      toast({
        title: 'Welcome to Amabilia!',
        description: 'Your account has been created successfully.'
      });
      navigate('/dashboard', {
        replace: true
      });
    }
    setIsLoading(false);
  };
  return <div className="min-h-screen bg-background flex">
      {/* 2026 Background Atmosphere */}
      <div className="bg-atmosphere" />
      
      {/* Left side - 2026 Branding with Obsidian Theme */}
      <div className="hidden lg:w-1/2 relative overflow-hidden lg:flex items-center justify-center bg-card">
        {/* Cyan circuit glow overlay */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/8 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center px-12 py-16 max-w-lg">
          {/* Logo mark */}
          <div className="w-16 h-16 rounded bg-primary/10 border border-primary/30 flex items-center justify-center cyan-glow mb-8">
            <span className="text-primary font-bold text-2xl">A</span>
          </div>
          
          <h1 className="font-bold mb-4 text-4xl text-foreground tracking-tight text-center">
            Amabilia Network
          </h1>
          <p className="text-lg mb-12 text-muted-foreground text-center leading-relaxed">
            Next-generation financial infrastructure for the global individual.
          </p>
          
          <div className="space-y-5 w-full">
            <div className="flex items-start gap-4 p-4 rounded bg-card/50 border border-border widget-hover">
              <div className="p-2.5 rounded bg-primary/10 border border-primary/20">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">₱600 Activation</h3>
                <p className="text-sm text-muted-foreground">One-time fee to unlock all features</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded bg-card/50 border border-border widget-hover">
              <div className="p-2.5 rounded bg-primary/10 border border-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">50% Commission</h3>
                <p className="text-sm text-muted-foreground">Earn on every membership referral</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded bg-card/50 border border-border widget-hover">
              <div className="p-2.5 rounded bg-primary/10 border border-primary/20">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Triple Wallet System</h3>
                <p className="text-sm text-muted-foreground">Task, Royalty, and Main wallets</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded bg-card/50 border border-border widget-hover">
              <div className="p-2.5 rounded bg-primary/10 border border-primary/20">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Enterprise Security</h3>
                <p className="text-sm text-muted-foreground">Bank-grade encryption & verification</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - 2026 Auth forms with sharp corners */}
      <div className="w-full lg:w-1/2 p-8 flex flex-col items-center justify-center relative">
        <Card className="w-full max-w-md border-border shadow-xl bg-card">
          <CardHeader className="text-center pb-2">
            <div className="lg:hidden mb-6 flex flex-col items-center">
              <div className="w-12 h-12 rounded bg-primary/10 border border-primary/30 flex items-center justify-center cyan-glow-sm mb-4">
                <span className="text-primary font-bold text-xl">A</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Amabilia Network</h1>
            </div>
            <CardTitle className="text-xl font-semibold">Welcome</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in or create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" placeholder="you@example.com" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input id="signup-name" type="text" placeholder="Juan Dela Cruz" value={signupFullName} onChange={e => setSignupFullName(e.target.value)} required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="you@example.com" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone (Optional)</Label>
                    <Input id="signup-phone" type="tel" placeholder="09171234567" value={signupPhone} onChange={e => setSignupPhone(e.target.value)} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input id="signup-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required minLength={8} className={signupPassword && !isPasswordValid ? 'border-destructive' : ''} />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {signupPassword && <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Progress value={passwordStrength.score} className="h-1.5 flex-1" />
                          <span className={`text-xs font-medium ${passwordStrength.score >= 100 ? 'text-success' : passwordStrength.score >= 50 ? 'text-warning' : 'text-destructive'}`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          {passwordStrength.requirements.map((req, idx) => <div key={idx} className="flex items-center gap-1 text-xs">
                              {req.met ? <Check className="h-3 w-3 text-success" /> : <X className="h-3 w-3 text-muted-foreground" />}
                              <span className={req.met ? 'text-success' : 'text-muted-foreground'}>
                                {req.label}
                              </span>
                            </div>)}
                        </div>
                      </div>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-referral">Referral Code (Optional)</Label>
                    <Input id="signup-referral" type="text" placeholder="ABC12345" value={signupReferralCode} onChange={e => setSignupReferralCode(e.target.value.toUpperCase())} />
                  </div>
                  
                  {/* Activation Notice */}
                  <Alert className="border-warning/30 bg-warning/10">
                    <Info className="h-4 w-4 text-warning" />
                    <AlertDescription className="text-xs text-muted-foreground">
                      New accounts start as <span className="font-medium text-warning">inactive</span>. 
                      Pay <span className="font-bold text-warning">₱300</span> after signup to activate and unlock all features.
                    </AlertDescription>
                  </Alert>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Free Account'}
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    You'll be able to activate your account after signing up
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>;
}