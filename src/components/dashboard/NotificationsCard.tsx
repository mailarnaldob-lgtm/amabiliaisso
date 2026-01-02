import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function NotificationsCard() {
  const { toast } = useToast();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);
  const [referralAlerts, setReferralAlerts] = useState(true);

  const handleToggle = (setting: string, value: boolean) => {
    // TODO: Persist to MySQL via edge function
    toast({
      title: 'Preference Updated',
      description: `${setting} has been ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Notifications
        </CardTitle>
        <CardDescription>Manage how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive updates via email</p>
          </div>
          <Switch
            id="email-notifications"
            checked={emailNotifications}
            onCheckedChange={(checked) => {
              setEmailNotifications(checked);
              handleToggle('Email notifications', checked);
            }}
          />
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <Label htmlFor="payment-alerts" className="font-medium">Payment Alerts</Label>
            <p className="text-sm text-muted-foreground">Get notified about payment status changes</p>
          </div>
          <Switch
            id="payment-alerts"
            checked={paymentAlerts}
            onCheckedChange={(checked) => {
              setPaymentAlerts(checked);
              handleToggle('Payment alerts', checked);
            }}
          />
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <Label htmlFor="referral-alerts" className="font-medium">Referral Alerts</Label>
            <p className="text-sm text-muted-foreground">Get notified when someone uses your referral link</p>
          </div>
          <Switch
            id="referral-alerts"
            checked={referralAlerts}
            onCheckedChange={(checked) => {
              setReferralAlerts(checked);
              handleToggle('Referral alerts', checked);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
