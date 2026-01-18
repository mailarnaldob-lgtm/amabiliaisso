import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Users, Wallet, Shield, Check, X } from 'lucide-react';
import { passwordSchema, getPasswordStrength } from '@/lib/validations';

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
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Password validation state
  const passwordStrength = getPasswordStrength(signupPassword);
  const passwordValidation = passwordSchema.safeParse(signupPassword);
  const passwordErrors = !passwordValidation.success 
    ? passwordValidation.error.errors.map(e => e.message) 
    : [];

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(loginEmail, loginPassword);
    
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password. Please try again.' 
          : error.message,
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate password with zod schema
    const passwordResult = passwordSchema.safeParse(signupPassword);
    if (!passwordResult.success) {
      toast({
        variant: 'destructive',
        title: 'Password Requirements Not Met',
        description: passwordResult.error.errors[0]?.message || 'Please create a stronger password.',
      });
      setIsLoading(false);
      return;
    }
    
    const { error } = await signUp(signupEmail, signupPassword, signupFullName, signupPhone, signupReferralCode);
    
    if (error) {
      let message = error.message;
      if (message.includes('already registered')) {
        message = 'This email is already registered. Please login instead.';
      }
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: message,
      });
    } else {
      toast({
        title: 'Welcome to Amabilia!',
        description: 'Your account has been created successfully.',
      });
      navigate('/dashboard');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <h1 className="text-5xl font-bold mb-6">Amabilia Network</h1>
          <p className="text-xl mb-12 opacity-90">
            Empowering Filipinos to earn daily through an ethical, sustainable, community-powered ecosystem.
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-foreground/20 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">40% Referral Commission</h3>
                <p className="opacity-80">Earn 40% on every membership you refer</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-foreground/20 rounded-lg">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">3 Wallet System</h3>
                <p className="opacity-80">Task, Royalty, and Main wallets for organized earnings</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary-foreground/20 rounded-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure & Verified</h3>
                <p className="opacity-80">KYC verified members for a trusted community</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Auth forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-border shadow-lg">
          <CardHeader className="text-center">
            <div className="lg:hidden mb-4">
              <h1 className="text-3xl font-bold text-primary">Amabilia Network</h1>
            </div>
            <CardTitle className="text-2xl">Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
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
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
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
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Juan Dela Cruz"
                      value={signupFullName}
                      onChange={(e) => setSignupFullName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Phone (Optional)</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="09171234567"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {signupPassword.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${passwordStrength.color}`}
                              style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium capitalize ${
                            passwordStrength.label === 'weak' ? 'text-destructive' :
                            passwordStrength.label === 'fair' ? 'text-yellow-600' :
                            passwordStrength.label === 'good' ? 'text-blue-600' :
                            'text-green-600'
                          }`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        
                        {/* Password Requirements Checklist */}
                        <div className="text-xs space-y-1">
                          <div className={`flex items-center gap-1.5 ${signupPassword.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {signupPassword.length >= 8 ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            At least 8 characters
                          </div>
                          <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(signupPassword) ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {/[A-Z]/.test(signupPassword) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            One uppercase letter
                          </div>
                          <div className={`flex items-center gap-1.5 ${/[a-z]/.test(signupPassword) ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {/[a-z]/.test(signupPassword) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            One lowercase letter
                          </div>
                          <div className={`flex items-center gap-1.5 ${/[0-9]/.test(signupPassword) ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {/[0-9]/.test(signupPassword) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            One number
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-referral">Referral Code (Optional)</Label>
                    <Input
                      id="signup-referral"
                      type="text"
                      placeholder="ABC12345"
                      value={signupReferralCode}
                      onChange={(e) => setSignupReferralCode(e.target.value.toUpperCase())}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
