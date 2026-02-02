import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { TaskManagementPanel } from '@/components/admin/TaskManagementPanel';
import { AdminNotificationCenter } from '@/components/admin/AdminNotificationCenter';
import { CampaignApprovalPanel } from '@/components/admin/CampaignApprovalPanel';
import { PaymentAssetManager } from '@/components/admin/PaymentAssetManager';
import { CashInAuditPanel } from '@/components/admin/CashInAuditPanel';
import { CashOutAuditPanel } from '@/components/admin/CashOutAuditPanel';
import { MediaManagerPanel } from '@/components/admin/MediaManagerPanel';
import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
import { 
  Bell,
  Building2,
  Settings,
  Wallet,
  LayoutGrid,
  Save,
  ArrowDownToLine,
  Video,
} from 'lucide-react';

export default function AdminSettings() {
  const { toast } = useToast();
  
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(false);

  const handleSaveSettings = () => {
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated successfully.',
    });
  };

  return (
    <AdminPageWrapper 
      title="SYSTEM CONFIGURATION" 
      description="Manage platform settings and payment configuration"
    >
      {() => (
        <div className="space-y-8 max-w-5xl">
          {/* Main Settings Tabs */}
          <Tabs defaultValue="cashin" className="w-full">
            <TabsList className="grid w-full grid-cols-7 mb-6 bg-card/50 border border-border">
              <TabsTrigger value="cashin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Wallet className="h-4 w-4 mr-2" />
                Cash-In
              </TabsTrigger>
              <TabsTrigger value="cashout" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Cash-Out
              </TabsTrigger>
              <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Bell className="h-4 w-4 mr-2" />
                Approvals
              </TabsTrigger>
              <TabsTrigger value="qr-manager" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Wallet className="h-4 w-4 mr-2" />
                QR Codes
              </TabsTrigger>
              <TabsTrigger value="media" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Video className="h-4 w-4 mr-2" />
                Media
              </TabsTrigger>
              <TabsTrigger value="tasks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Settings className="h-4 w-4 mr-2" />
                Platform
              </TabsTrigger>
            </TabsList>

            {/* Cash-In Audit Panel Tab */}
            <TabsContent value="cashin">
              <CashInAuditPanel />
            </TabsContent>

            {/* Cash-Out Audit Panel Tab */}
            <TabsContent value="cashout">
              <CashOutAuditPanel />
            </TabsContent>

            {/* Notifications & Approvals Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <AdminNotificationCenter />
              <CampaignApprovalPanel />
            </TabsContent>

            {/* NEW: Payment Asset Manager Tab (Independent Module) */}
            <TabsContent value="qr-manager">
              <PaymentAssetManager />
            </TabsContent>

            {/* Media Manager Tab */}
            <TabsContent value="media">
              <MediaManagerPanel />
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks">
              <TaskManagementPanel />
            </TabsContent>

            {/* Platform Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              {/* Platform Settings */}
              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-mono">
                    <Building2 className="h-5 w-5 text-primary" />
                    Platform Information
                  </CardTitle>
                  <CardDescription>Basic information about the platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="platformName" className="text-muted-foreground">Platform Name</Label>
                    <Input 
                      id="platformName" 
                      defaultValue="AMABILIA Network" 
                      className="bg-background border-primary/10 focus:border-primary/30 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platformEmail" className="text-muted-foreground">Contact Email</Label>
                    <Input 
                      id="platformEmail" 
                      type="email" 
                      defaultValue="admin@amabilianetwork.com" 
                      className="bg-background border-primary/10 focus:border-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platformPhone" className="text-muted-foreground">Support Number</Label>
                    <Input 
                      id="platformPhone" 
                      defaultValue="+63 917 123 4567" 
                      className="bg-background border-primary/10 focus:border-primary/30 font-mono"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-mono">
                    <Bell className="h-5 w-5 text-primary" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Configure how you receive alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="space-y-0.5">
                      <Label className="text-foreground">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email updates about platform activity
                      </p>
                    </div>
                    <Switch
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <Separator className="bg-primary/10" />
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="space-y-0.5">
                      <Label className="text-foreground">New Member Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when new members join
                      </p>
                    </div>
                    <Switch
                      checked={orderAlerts}
                      onCheckedChange={setOrderAlerts}
                    />
                  </div>
                  
                  <Separator className="bg-primary/10" />
                  
                  <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="space-y-0.5">
                      <Label className="text-foreground">Low Balance Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when system wallet is low
                      </p>
                    </div>
                    <Switch
                      checked={lowStockAlerts}
                      onCheckedChange={setLowStockAlerts}
                    />
                  </div>

                  <Button onClick={handleSaveSettings} className="w-full bg-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Notification Preferences
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </AdminPageWrapper>
  );
}
