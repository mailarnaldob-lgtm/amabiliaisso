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
import { Eye, EyeOff, Users, Wallet, Shield, Info, CreditCard, Check, X, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

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
  const requirements = [
    { met: password.length >= PASSWORD_REQUIREMENTS.minLength, label: 'At least 8 characters' },
    { met: PASSWORD_REQUIREMENTS.hasUppercase.test(password), label: 'One uppercase letter' },
    { met: PASSWORD_REQUIREMENTS.hasLowercase.test(password), label: 'One lowercase letter' },
    { met: PASSWORD_REQUIREMENTS.hasNumber.test(password), label: 'One number' }
  ];
  
  const metCount = requirements.filter(r => r.met).length;
  const score = (metCount / requirements.length) * 100;
  
  let label = 'Weak';
  let color = 'text-destructive';
  
  if (score >= 100) {
    label = 'Strong';
    color = 'text-green-500';
  } else if (score >= 75) {
    label = 'Good';
    color = 'text-amber-400';
  } else if (score >= 50) {
    label = 'Fair';
    color = 'text-amber-400';
  }
  
  return { score, label, color, requirements };
}

// Feature card component with golden styling
function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  delay 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  delay: number;
}) {
  return (
    <motion.div 
      className="flex items-start gap-4 p-4 rounded-lg"
      style={{
        background: 'linear-gradient(135deg, hsl(220 23% 10%) 0%, hsl(220 23% 6%) 100%)',
        border: '1px solid hsl(45 100% 51% / 0.15)'
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ 
        borderColor: 'hsl(45 100% 51% / 0.4)',
        boxShadow: '0 0 20px hsl(45 100% 51% / 0.1)'
      }}
    >
      <div 
        className="p-2.5 rounded-lg"
        style={{
          background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, hsl(45 100% 51% / 0.05) 100%)',
          border: '1px solid hsl(45 100% 51% / 0.25)'
        }}
      >
        <Icon className="h-5 w-5 text-amber-400" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
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
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Password strength indicator
  const passwordStrength = useMemo(() => validatePasswordStrength(signupPassword), [signupPassword]);
  const isPasswordValid = passwordStrength.score >= 100;

  // Zero-latency redirect for authenticated users
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
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
          : error.message
      });
    } else {
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.'
      });
      navigate('/dashboard', { replace: true });
    }
    setIsLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!isPasswordValid) {
      toast({
        variant: 'destructive',
        title: 'Password Too Weak',
        description: 'Password must be at least 8 characters with uppercase, lowercase, and a number.'
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
        description: message
      });
    } else {
      toast({
        title: 'Welcome to Amabilia!',
        description: 'Your account has been created successfully.'
      });
      navigate('/dashboard', { replace: true });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: 'hsl(220 23% 4%)' }}>
      {/* Premium Dark Background with Grid */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(45 100% 51% / 0.3) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(45 100% 51% / 0.3) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      
      {/* Left side - Golden Elite Branding */}
      <div className="hidden lg:w-1/2 relative overflow-hidden lg:flex items-center justify-center">
        {/* Golden glow orbs */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/8 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500/6 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center px-12 py-16 max-w-lg">
          {/* Animated Logo Mark */}
          <motion.div 
            className="w-20 h-20 rounded-lg flex items-center justify-center mb-8"
            style={{
              background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, hsl(45 100% 51% / 0.05) 100%)',
              border: '2px solid hsl(45 100% 51% / 0.3)',
              boxShadow: '0 0 40px hsl(45 100% 51% / 0.3)'
            }}
            initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 60px hsl(45 100% 51% / 0.5)'
            }}
          >
            <span 
              className="font-bold text-3xl"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              ₳
            </span>
          </motion.div>
          
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{
              background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.1) 0%, transparent 100%)',
              border: '1px solid hsl(45 100% 51% / 0.2)'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-xs font-semibold tracking-wider uppercase">Sovereign Financial Platform</span>
          </motion.div>
          
          <motion.h1 
            className="font-bold mb-4 text-4xl tracking-tight text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span 
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              ₳mabilia
            </span>
            <span className="text-foreground"> Network</span>
          </motion.h1>
          
          <motion.p 
            className="text-lg mb-12 text-muted-foreground text-center leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Next-generation financial infrastructure for the global individual.
          </motion.p>
          
          <div className="space-y-4 w-full">
            <FeatureCard 
              icon={CreditCard} 
              title="₱600 Activation" 
              description="One-time fee to unlock all features" 
              delay={0.5}
            />
            <FeatureCard 
              icon={Users} 
              title="50% Commission" 
              description="Earn on every membership referral" 
              delay={0.6}
            />
            <FeatureCard 
              icon={Wallet} 
              title="Triple Wallet System" 
              description="Task, Royalty, and Main wallets" 
              delay={0.7}
            />
            <FeatureCard 
              icon={Shield} 
              title="Enterprise Security" 
              description="Bank-grade encryption & verification" 
              delay={0.8}
            />
          </div>
        </div>
      </div>
      
      {/* Right side - Auth forms with golden accents */}
      <div className="w-full lg:w-1/2 p-8 flex flex-col items-center justify-center relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card 
            className="border-0 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, hsl(220 23% 10%) 0%, hsl(220 23% 6%) 100%)',
              boxShadow: '0 25px 50px hsl(0 0% 0% / 0.5), 0 0 40px hsl(45 100% 51% / 0.05)'
            }}
          >
            <CardHeader className="text-center pb-2">
              {/* Mobile Logo */}
              <div className="lg:hidden mb-6 flex flex-col items-center">
                <motion.div 
                  className="w-14 h-14 rounded-lg flex items-center justify-center mb-4"
                  style={{
                    background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.15) 0%, hsl(45 100% 51% / 0.05) 100%)',
                    border: '1px solid hsl(45 100% 51% / 0.3)',
                    boxShadow: '0 0 30px hsl(45 100% 51% / 0.2)'
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <span 
                    className="font-bold text-2xl"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    ₳
                  </span>
                </motion.div>
                <h1 className="text-2xl font-bold">
                  <span className="text-amber-400">₳mabilia</span>
                  <span className="text-foreground"> Network</span>
                </h1>
              </div>
              <CardTitle className="text-xl font-semibold text-foreground">Welcome</CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in or create your account
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList 
                  className="grid w-full grid-cols-2 mb-4"
                  style={{
                    background: 'hsl(220 23% 8%)',
                    border: '1px solid hsl(45 100% 51% / 0.1)'
                  }}
                >
                  <TabsTrigger 
                    value="login"
                    className="data-[state=active]:bg-amber-400/20 data-[state=active]:text-amber-400"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="data-[state=active]:bg-amber-400/20 data-[state=active]:text-amber-400"
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-foreground">Email</Label>
                      <Input 
                        id="login-email" 
                        type="email" 
                        placeholder="you@example.com" 
                        value={loginEmail} 
                        onChange={e => setLoginEmail(e.target.value)} 
                        required
                        className="bg-background/50 border-border focus:border-amber-400/50 focus:ring-amber-400/20"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-foreground">Password</Label>
                      <div className="relative">
                        <Input 
                          id="login-password" 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="••••••••" 
                          value={loginPassword} 
                          onChange={e => setLoginPassword(e.target.value)} 
                          required
                          className="bg-background/50 border-border focus:border-amber-400/50 focus:ring-amber-400/20"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-amber-400" 
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button 
                        type="submit" 
                        className="w-full font-semibold text-black"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          boxShadow: '0 0 20px hsl(45 100% 51% / 0.3)'
                        }}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                      </Button>
                    </motion.div>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-foreground">Full Name</Label>
                      <Input 
                        id="signup-name" 
                        type="text" 
                        placeholder="Juan Dela Cruz" 
                        value={signupFullName} 
                        onChange={e => setSignupFullName(e.target.value)} 
                        required
                        className="bg-background/50 border-border focus:border-amber-400/50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="you@example.com" 
                        value={signupEmail} 
                        onChange={e => setSignupEmail(e.target.value)} 
                        required
                        className="bg-background/50 border-border focus:border-amber-400/50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone" className="text-foreground">Phone (Optional)</Label>
                      <Input 
                        id="signup-phone" 
                        type="tel" 
                        placeholder="09171234567" 
                        value={signupPhone} 
                        onChange={e => setSignupPhone(e.target.value)}
                        className="bg-background/50 border-border focus:border-amber-400/50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-foreground">Password</Label>
                      <div className="relative">
                        <Input 
                          id="signup-password" 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="••••••••" 
                          value={signupPassword} 
                          onChange={e => setSignupPassword(e.target.value)} 
                          required 
                          minLength={8}
                          className={`bg-background/50 border-border focus:border-amber-400/50 ${signupPassword && !isPasswordValid ? 'border-destructive' : ''}`}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-amber-400" 
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {signupPassword && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full rounded-full"
                                style={{
                                  background: passwordStrength.score >= 100 
                                    ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                                    : passwordStrength.score >= 50 
                                    ? 'linear-gradient(90deg, #FFD700, #FFA500)'
                                    : 'linear-gradient(90deg, #ef4444, #dc2626)'
                                }}
                                initial={{ width: 0 }}
                                animate={{ width: `${passwordStrength.score}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            <span className={`text-xs font-medium ${passwordStrength.score >= 100 ? 'text-green-500' : passwordStrength.score >= 50 ? 'text-amber-400' : 'text-destructive'}`}>
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {passwordStrength.requirements.map((req, idx) => (
                              <div key={idx} className="flex items-center gap-1 text-xs">
                                {req.met 
                                  ? <Check className="h-3 w-3 text-green-500" /> 
                                  : <X className="h-3 w-3 text-muted-foreground" />
                                }
                                <span className={req.met ? 'text-green-500' : 'text-muted-foreground'}>
                                  {req.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-referral" className="text-foreground">Referral Code (Optional)</Label>
                      <Input 
                        id="signup-referral" 
                        type="text" 
                        placeholder="ABC12345" 
                        value={signupReferralCode} 
                        onChange={e => setSignupReferralCode(e.target.value.toUpperCase())}
                        className="bg-background/50 border-border focus:border-amber-400/50"
                      />
                    </div>
                    
                    {/* Activation Notice with Golden styling */}
                    <Alert 
                      className="border-0"
                      style={{
                        background: 'linear-gradient(135deg, hsl(45 100% 51% / 0.1) 0%, hsl(45 100% 51% / 0.05) 100%)',
                        border: '1px solid hsl(45 100% 51% / 0.2)'
                      }}
                    >
                      <Info className="h-4 w-4 text-amber-400" />
                      <AlertDescription className="text-xs text-muted-foreground">
                        New accounts start as <span className="font-medium text-amber-400">inactive</span>. 
                        Pay <span className="font-bold text-amber-400">₱300</span> after signup to activate and unlock all features.
                      </AlertDescription>
                    </Alert>
                    
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Button 
                        type="submit" 
                        className="w-full font-semibold text-black"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          boxShadow: '0 0 20px hsl(45 100% 51% / 0.3)'
                        }}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Creating account...' : 'Create Free Account'}
                      </Button>
                    </motion.div>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      You'll be able to activate your account after signing up
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
