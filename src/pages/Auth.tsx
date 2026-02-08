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
import { Eye, EyeOff, Users, Wallet, Shield, Info, CreditCard, Check, X, Sparkles, Crown, Zap, Star } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

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
    color = 'text-green-500';
  } else if (score >= 75) {
    label = 'Good';
    color = 'text-amber-400';
  } else if (score >= 50) {
    label = 'Fair';
    color = 'text-amber-400';
  }
  return {
    score,
    label,
    color,
    requirements
  };
}

// Sovereign Feature card component with cinematic styling
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
      className="flex items-start gap-4 p-4 rounded-xl backdrop-blur-xl" 
      style={{
        background: 'linear-gradient(135deg, rgba(5,5,5,0.8) 0%, rgba(10,10,10,0.6) 100%)',
        border: '1px solid rgba(255,215,0,0.15)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
      }} 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }} 
      transition={{ delay, duration: 0.5 }} 
      whileHover={{
        borderColor: 'rgba(255,215,0,0.4)',
        boxShadow: '0 0 30px rgba(255,215,0,0.15), 0 4px 24px rgba(0,0,0,0.4)'
      }}
    >
      <div 
        className="p-2.5 rounded-lg" 
        style={{
          background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,215,0,0.05) 100%)',
          border: '1px solid rgba(255,215,0,0.25)',
          boxShadow: '0 0 20px rgba(255,215,0,0.1)'
        }}
      >
        <Icon className="h-5 w-5 text-[#FFD700]" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

// Sovereign Tier Badge Component
function TierBadge({ 
  tier, 
  selected, 
  onClick 
}: { 
  tier: { id: string; name: string; price: number; icon: React.ElementType; features: string[] };
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = tier.icon;
  
  return (
    <motion.button
      type="button"
      onClick={onClick}
      className={`relative p-4 rounded-xl text-left transition-all duration-300 ${
        selected ? 'ring-2 ring-[#FFD700]' : ''
      }`}
      style={{
        background: selected 
          ? 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,165,0,0.1) 100%)'
          : 'linear-gradient(135deg, rgba(5,5,5,0.6) 0%, rgba(15,15,15,0.4) 100%)',
        border: selected 
          ? '1px solid rgba(255,215,0,0.5)' 
          : '1px solid rgba(255,255,255,0.1)',
        boxShadow: selected 
          ? '0 0 30px rgba(255,215,0,0.2)' 
          : 'none'
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {selected && (
        <motion.div
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        >
          <Check className="w-4 h-4 text-black" />
        </motion.div>
      )}
      
      <div className="flex items-center gap-3 mb-2">
        <div 
          className="p-2 rounded-lg"
          style={{
            background: selected 
              ? 'linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(255,215,0,0.1) 100%)'
              : 'rgba(255,255,255,0.05)',
            border: selected 
              ? '1px solid rgba(255,215,0,0.3)' 
              : '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <Icon className={`w-4 h-4 ${selected ? 'text-[#FFD700]' : 'text-muted-foreground'}`} />
        </div>
        <div>
          <span className={`font-bold text-sm ${selected ? 'text-[#FFD700]' : 'text-foreground'}`}>
            {tier.name}
          </span>
          <div className="text-xs text-muted-foreground">
            ₱{tier.price.toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground line-clamp-2">
        {tier.features[0]}
      </div>
    </motion.button>
  );
}

// Sovereign Tiers Configuration
const SOVEREIGN_TIERS = [
  {
    id: 'pro',
    name: 'PRO',
    price: 300,
    icon: Zap,
    features: ['Full VPA Mission Access', '50% Referral Commission', 'Omni-Transfer Engine']
  },
  {
    id: 'expert',
    name: 'EXPERT',
    price: 600,
    icon: Star,
    features: ['All Pro Features', '10% Network Overrides', 'Priority Mission Queue']
  },
  {
    id: 'elite',
    name: 'ELITE',
    price: 900,
    icon: Crown,
    features: ['Alpha Bankers Cooperative', '1% Daily Vault Yield', 'P2P Lending Access']
  }
];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>('pro');

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

  // Zero-latency redirect for authenticated users with 0.3s transition
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
        title: 'Access Denied',
        description: error.message === 'Invalid login credentials' 
          ? 'Invalid credentials. Verify your email and password.' 
          : error.message
      });
    } else {
      toast({
        title: 'Welcome to the Alpha Ecosystem',
        description: 'Sovereign authentication successful.'
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
        title: 'Security Protocol Failed',
        description: 'Password must meet all sovereign security requirements.'
      });
      setIsLoading(false);
      return;
    }
    
    const { error } = await signUp(signupEmail, signupPassword, signupFullName, signupPhone, signupReferralCode);
    
    if (error) {
      let message = error.message;
      if (message.includes('already registered')) {
        message = 'This identity is already registered. Please use the login portal.';
      }
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: message
      });
    } else {
      toast({
        title: 'Welcome to AMABILIA NETWORK',
        description: `Your ${selectedTier.toUpperCase()} account has been created. Activate to unlock the Alpha Ecosystem.`
      });
      navigate('/dashboard', { replace: true });
    }
    setIsLoading(false);
  };

  const selectedTierData = SOVEREIGN_TIERS.find(t => t.id === selectedTier);

  return (
    <div 
      className="min-h-screen flex overflow-hidden"
      style={{ background: '#050505' }}
    >
      {/* Obsidian Black Background with Alpha Gold Grid */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(rgba(255,215,0,0.4) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,215,0,0.4) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} 
      />
      
      {/* Left side - Sovereign Branding Panel */}
      <div className="hidden lg:w-1/2 relative overflow-hidden lg:flex items-center justify-center">
        {/* Alpha Gold Ambient Glow */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[200px]"
            style={{ background: 'rgba(255,215,0,0.08)' }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.08, 0.12, 0.08]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div 
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[150px]"
            style={{ background: 'rgba(255,165,0,0.06)' }}
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.06, 0.1, 0.06]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center px-12 py-16 max-w-lg">
          {/* Animated Sovereign Logo */}
          <motion.div 
            className="w-24 h-24 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,215,0,0.05) 100%)',
              border: '2px solid rgba(255,215,0,0.4)',
              boxShadow: '0 0 60px rgba(255,215,0,0.3), inset 0 0 30px rgba(255,215,0,0.1)'
            }}
            initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8 }}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: '0 0 80px rgba(255,215,0,0.5), inset 0 0 40px rgba(255,215,0,0.15)'
            }}
          >
            <span 
              className="font-bold text-7xl"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FFD700 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 10px rgba(255,215,0,0.5))'
              }}
            >
              ₳
            </span>
          </motion.div>
          
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 backdrop-blur-md"
            style={{
              background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, transparent 100%)',
              border: '1px solid rgba(255,215,0,0.25)'
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-[#FFD700]" />
            <span className="text-[#FFD700] text-xs font-semibold tracking-wider uppercase">
              Sovereign Financial Platform
            </span>
          </motion.div>
          
          {/* Sovereign Headline */}
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
              AMABILIA NETWORK
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg mb-4 text-center font-medium"
            style={{ color: 'rgba(255,215,0,0.8)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            Secure Entry to the Alpha Ecosystem
          </motion.p>
          
          <motion.p 
            className="text-sm mb-12 text-muted-foreground text-center leading-relaxed max-w-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Next-generation financial infrastructure for sovereign individuals. 
            Join the network of elite earners.
          </motion.p>
          
          <div className="space-y-4 w-full">
            <FeatureCard 
              icon={CreditCard} 
              title="₱300 PRO Activation" 
              description="Unlock full platform access" 
              delay={0.5} 
            />
            <FeatureCard 
              icon={Users} 
              title="50% Direct Commission" 
              description="Earn on every referral upgrade" 
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
              title="Sovereign Security" 
              description="Bank-grade encryption & RLS" 
              delay={0.8} 
            />
          </div>
        </div>
      </div>
      
      {/* Right side - Auth Card with Alpha Gold Glow */}
      <div className="w-full lg:w-1/2 p-8 flex flex-col items-center justify-center relative">
        {/* Subtle glow behind card */}
        <div 
          className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-20"
          style={{ background: 'rgba(255,215,0,0.15)' }}
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          {/* Sovereign Auth Card with Glassmorphism */}
          <Card 
            className="border-0 shadow-2xl backdrop-blur-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(10,10,10,0.95) 0%, rgba(5,5,5,0.9) 100%)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.6), 0 0 60px rgba(255,215,0,0.08), inset 0 1px 0 rgba(255,215,0,0.1)',
              border: '1px solid rgba(255,215,0,0.2)'
            }}
          >
            {/* Alpha Gold Top Border Glow */}
            <div 
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
                boxShadow: '0 0 20px rgba(255,215,0,0.5)'
              }}
            />
            
            <CardHeader className="text-center pb-2 pt-8">
              {/* Mobile Logo */}
              <div className="lg:hidden mb-6 flex flex-col items-center">
                <motion.div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 backdrop-blur-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(255,215,0,0.05) 100%)',
                    border: '1px solid rgba(255,215,0,0.3)',
                    boxShadow: '0 0 40px rgba(255,215,0,0.25)'
                  }}
                  whileHover={{ scale: 1.05 }}
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
                <h1 className="text-2xl font-bold tracking-tight">
                  <span className="text-[#FFD700]">AMABILIA</span>
                  <span className="text-foreground"> NETWORK</span>
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Secure Entry to the Alpha Ecosystem
                </p>
              </div>
              
              <CardTitle className="text-xl font-semibold text-foreground">
                Sovereign Access
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in or register your sovereign identity
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-8">
              <Tabs defaultValue="login" className="w-full">
                <TabsList 
                  className="grid w-full grid-cols-2 mb-6" 
                  style={{
                    background: 'rgba(5,5,5,0.8)',
                    border: '1px solid rgba(255,215,0,0.15)'
                  }}
                >
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-[#FFD700]/20 data-[state=active]:text-[#FFD700] transition-all duration-300"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup" 
                    className="data-[state=active]:bg-[#FFD700]/20 data-[state=active]:text-[#FFD700] transition-all duration-300"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>
                
                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-foreground text-sm">
                        Email Address
                      </Label>
                      <Input 
                        id="login-email" 
                        type="email" 
                        placeholder="sovereign@amabilia.net" 
                        value={loginEmail} 
                        onChange={e => setLoginEmail(e.target.value)} 
                        required 
                        className="bg-black/50 border-white/10 focus:border-[#FFD700]/50 focus:ring-[#FFD700]/20 placeholder:text-muted-foreground/50" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-foreground text-sm">
                        Password
                      </Label>
                      <div className="relative">
                        <Input 
                          id="login-password" 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="••••••••" 
                          value={loginPassword} 
                          onChange={e => setLoginPassword(e.target.value)} 
                          required 
                          className="bg-black/50 border-white/10 focus:border-[#FFD700]/50 focus:ring-[#FFD700]/20" 
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-[#FFD700]" 
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <motion.div 
                      whileHover={{ scale: 1.01 }} 
                      whileTap={{ scale: 0.98 }}
                      className="pt-2"
                    >
                      <Button 
                        type="submit" 
                        className="w-full font-semibold text-black h-11"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          boxShadow: '0 0 30px rgba(255,215,0,0.3)'
                        }}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Authenticating...' : 'Enter Alpha Ecosystem'}
                      </Button>
                    </motion.div>
                  </form>
                </TabsContent>
                
                {/* Registration Tab */}
                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-foreground text-sm">
                        Full Name
                      </Label>
                      <Input 
                        id="signup-name" 
                        type="text" 
                        placeholder="Juan Dela Cruz" 
                        value={signupFullName} 
                        onChange={e => setSignupFullName(e.target.value)} 
                        required 
                        className="bg-black/50 border-white/10 focus:border-[#FFD700]/50" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-foreground text-sm">
                        Email Address
                      </Label>
                      <Input 
                        id="signup-email" 
                        type="email" 
                        placeholder="sovereign@amabilia.net" 
                        value={signupEmail} 
                        onChange={e => setSignupEmail(e.target.value)} 
                        required 
                        className="bg-black/50 border-white/10 focus:border-[#FFD700]/50" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone" className="text-foreground text-sm">
                        Phone (Optional)
                      </Label>
                      <Input 
                        id="signup-phone" 
                        type="tel" 
                        placeholder="09171234567" 
                        value={signupPhone} 
                        onChange={e => setSignupPhone(e.target.value)} 
                        className="bg-black/50 border-white/10 focus:border-[#FFD700]/50" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-foreground text-sm">
                        Secure Password
                      </Label>
                      <div className="relative">
                        <Input 
                          id="signup-password" 
                          type={showPassword ? 'text' : 'password'} 
                          placeholder="••••••••" 
                          value={signupPassword} 
                          onChange={e => setSignupPassword(e.target.value)} 
                          required 
                          minLength={8} 
                          className={`bg-black/50 border-white/10 focus:border-[#FFD700]/50 ${
                            signupPassword && !isPasswordValid ? 'border-destructive' : ''
                          }`} 
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-[#FFD700]" 
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      <AnimatePresence>
                        {signupPassword && (
                          <motion.div 
                            className="space-y-2"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
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
                              <span className={`text-xs font-medium ${
                                passwordStrength.score >= 100 
                                  ? 'text-green-500' 
                                  : passwordStrength.score >= 50 
                                    ? 'text-[#FFD700]' 
                                    : 'text-destructive'
                              }`}>
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
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    
                    {/* Sovereign Tier Selection */}
                    <div className="space-y-3">
                      <Label className="text-foreground text-sm">
                        Select Sovereign Tier
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {SOVEREIGN_TIERS.map(tier => (
                          <TierBadge
                            key={tier.id}
                            tier={tier}
                            selected={selectedTier === tier.id}
                            onClick={() => setSelectedTier(tier.id)}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-referral" className="text-foreground text-sm">
                        Referral Code (Optional)
                      </Label>
                      <Input 
                        id="signup-referral" 
                        type="text" 
                        placeholder="ABC12345" 
                        value={signupReferralCode} 
                        onChange={e => setSignupReferralCode(e.target.value.toUpperCase())} 
                        className="bg-black/50 border-white/10 focus:border-[#FFD700]/50 font-mono" 
                      />
                    </div>
                    
                    {/* Activation Notice with Sovereign styling */}
                    <Alert 
                      className="border-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.05) 100%)',
                        border: '1px solid rgba(255,215,0,0.2)'
                      }}
                    >
                      <Info className="h-4 w-4 text-[#FFD700]" />
                      <AlertDescription className="text-xs text-muted-foreground">
                        New accounts start as <span className="font-medium text-[#FFD700]">inactive</span>. 
                        Pay <span className="font-bold text-[#FFD700]">₱{selectedTierData?.price.toLocaleString()}</span> after 
                        signup to activate your <span className="font-bold text-[#FFD700]">{selectedTierData?.name}</span> account.
                      </AlertDescription>
                    </Alert>
                    
                    <motion.div 
                      whileHover={{ scale: 1.01 }} 
                      whileTap={{ scale: 0.98 }}
                      className="pt-2"
                    >
                      <Button 
                        type="submit" 
                        className="w-full font-semibold text-black h-11"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          boxShadow: '0 0 30px rgba(255,215,0,0.3)'
                        }}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Creating Sovereign Identity...' : `Register as ${selectedTierData?.name}`}
                      </Button>
                    </motion.div>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      Activate your account after registration to unlock the Alpha Ecosystem
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Sovereign Footer */}
          <motion.p 
            className="text-xs text-center text-muted-foreground/50 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Protected by Sovereign Security Protocol
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
