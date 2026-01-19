import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Key, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PasswordChangeDialog } from './PasswordChangeDialog';

export function AccountSecurityCard() {
  const { toast } = useToast();

  const handleEnable2FA = () => {
    toast({
      title: 'Feature Coming Soon',
      description: 'Two-factor authentication will be available in a future update.',
    });
  };

  return (
    <Card id="account-security" className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Account Security
        </CardTitle>
        <CardDescription>Manage your account security settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Password</p>
              <p className="text-sm text-muted-foreground">Change your account password</p>
            </div>
          </div>
          <PasswordChangeDialog 
            trigger={
              <Button variant="outline" size="sm">
                Change
              </Button>
            }
          />
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleEnable2FA}>
            Enable
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
