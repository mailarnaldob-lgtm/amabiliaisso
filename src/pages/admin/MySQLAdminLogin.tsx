import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, Loader2 } from 'lucide-react';

// Session token stored in memory only (not localStorage)
let adminSessionToken: string | null = null;
let adminSessionExpiry: number | null = null;

export function getAdminSessionToken(): string | null {
  // Check if session expired
  if (adminSessionExpiry && Date.now() > adminSessionExpiry) {
    adminSessionToken = null;
    adminSessionExpiry = null;
    return null;
  }
  return adminSessionToken;
}

export function clearAdminSession(): void {
  adminSessionToken = null;
  adminSessionExpiry = null;
}

export function setAdminSession(token: string, expiresAt: string): void {
  adminSessionToken = token;
  adminSessionExpiry = new Date(expiresAt).getTime();
}

export default function MySQLAdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter username and password');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('mysql-admin-login', {
        body: { username: username.trim(), password }
      });

      if (error) {
        console.error('Login error:', error);
        toast.error('Login failed. Please try again.');
        return;
      }

      if (data?.success && data?.session_token) {
        // Store session token in memory only (not localStorage)
        setAdminSession(data.session_token, data.expires_at);
        toast.success('Login successful!');
        navigate('/admin/task-proofs');
      } else {
        toast.error(data?.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Portal</CardTitle>
          <CardDescription>
            Sign in to access the administration dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin@amabilianetwork.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
