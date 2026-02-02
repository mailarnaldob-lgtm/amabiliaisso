import { useState } from 'react';
import { AlphaLayout } from '@/components/layouts/AlphaLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAdCampaigns, CAMPAIGN_TYPES } from '@/hooks/useAdCampaigns';
import { useProfile } from '@/hooks/useProfile';
import { AdWizardModal } from '@/components/alpha/AdWizardModal';
import { TierGate } from '@/components/tier/TierGate';
import { 
  Plus, 
  Megaphone, 
  Eye, 
  Users, 
  Pause, 
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function AdsApp() {
  const [showWizard, setShowWizard] = useState(false);
  const { myCampaigns, isLoadingMyCampaigns, toggleCampaignStatus } = useAdCampaigns();
  const profileQuery = useProfile();
  const profile = profileQuery.data;

  const isPro = profile?.membership_tier === 'pro' || profile?.membership_tier === 'elite';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'paused': return <Pause className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      active: 'default',
      pending: 'secondary',
      paused: 'outline',
      completed: 'default',
      cancelled: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'secondary'} className="capitalize">
        {getStatusIcon(status)}
        <span className="ml-1">{status}</span>
      </Badge>
    );
  };

  const activeCampaigns = myCampaigns?.filter(c => c.status === 'active') || [];
  const pendingCampaigns = myCampaigns?.filter(c => c.status === 'pending') || [];
  const completedCampaigns = myCampaigns?.filter(c => ['completed', 'cancelled', 'paused'].includes(c.status)) || [];

  const totalSpent = myCampaigns?.reduce((sum, c) => sum + c.total_budget - c.remaining_budget, 0) || 0;
  const totalCompletions = myCampaigns?.reduce((sum, c) => sum + c.current_completions, 0) || 0;

  return (
    <AlphaLayout 
      title="Ad Wizard" 
      subtitle="Create campaigns to grow your brand"
    >
      <TierGate requiredTier="pro" featureName="Ad Wizard">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-500">{activeCampaigns.length}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{totalCompletions}</div>
              <div className="text-xs text-muted-foreground">Completions</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">₳{totalSpent.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Spent</div>
            </CardContent>
          </Card>
        </div>

        {/* Create Campaign CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/40 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
            <CardContent className="p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Create New Campaign
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Reach thousands of VPA workers to promote your brand
                  </p>
                </div>
                <Button 
                  onClick={() => setShowWizard(true)}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Ad
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Campaign Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="active" className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              Active ({activeCampaigns.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Pending ({pendingCampaigns.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              History ({completedCampaigns.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeCampaigns.length === 0 ? (
              <Card className="p-8 text-center">
                <Megaphone className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No active campaigns</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowWizard(true)}
                >
                  Create Your First Campaign
                </Button>
              </Card>
            ) : (
              activeCampaigns.map((campaign) => (
                <CampaignCard 
                  key={campaign.id} 
                  campaign={campaign} 
                  onToggle={toggleCampaignStatus}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingCampaigns.length === 0 ? (
              <Card className="p-8 text-center">
                <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No pending campaigns</p>
              </Card>
            ) : (
              pendingCampaigns.map((campaign) => (
                <CampaignCard 
                  key={campaign.id} 
                  campaign={campaign} 
                  onToggle={toggleCampaignStatus}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {completedCampaigns.length === 0 ? (
              <Card className="p-8 text-center">
                <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No campaign history</p>
              </Card>
            ) : (
              completedCampaigns.map((campaign) => (
                <CampaignCard 
                  key={campaign.id} 
                  campaign={campaign} 
                  onToggle={toggleCampaignStatus}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Ad Wizard Modal */}
        <AdWizardModal isOpen={showWizard} onClose={() => setShowWizard(false)} />
      </TierGate>
    </AlphaLayout>
  );
}

interface CampaignCardProps {
  campaign: any;
  onToggle: any;
}

function CampaignCard({ campaign, onToggle }: CampaignCardProps) {
  const completionRate = campaign.max_completions > 0 
    ? (campaign.current_completions / campaign.max_completions) * 100 
    : 0;
  
  const budgetUsed = campaign.total_budget > 0
    ? ((campaign.total_budget - campaign.remaining_budget) / campaign.total_budget) * 100
    : 0;

  const campaignType = CAMPAIGN_TYPES.find(t => t.value === campaign.campaign_type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{campaignType?.icon || '📢'}</span>
              <div>
                <CardTitle className="text-base">{campaign.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{campaignType?.label}</p>
              </div>
            </div>
            {campaign.status === 'active' || campaign.status === 'paused' ? (
              <Badge variant={campaign.status === 'active' ? 'default' : 'outline'} className="capitalize">
                {campaign.status === 'active' ? (
                  <Play className="w-3 h-3 mr-1" />
                ) : (
                  <Pause className="w-3 h-3 mr-1" />
                )}
                {campaign.status}
              </Badge>
            ) : (
              <Badge variant="secondary" className="capitalize">
                {campaign.status}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Users className="w-3 h-3" />
                <span>Completions</span>
              </div>
              <Progress value={completionRate} className="h-2" />
              <p className="text-xs mt-1">{campaign.current_completions} / {campaign.max_completions}</p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <TrendingUp className="w-3 h-3" />
                <span>Budget Used</span>
              </div>
              <Progress value={budgetUsed} className="h-2" />
              <p className="text-xs mt-1">₳{(campaign.total_budget - campaign.remaining_budget).toFixed(0)} / ₳{campaign.total_budget}</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Reward: ₳{campaign.reward_per_task}/task</span>
              {campaign.expires_at && (
                <span>Expires: {format(new Date(campaign.expires_at), 'MMM d, yyyy')}</span>
              )}
            </div>
            
            {campaign.status === 'active' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onToggle.mutate({ campaignId: campaign.id, action: 'pause' })}
              >
                <Pause className="w-3 h-3 mr-1" />
                Pause
              </Button>
            )}
            {campaign.status === 'paused' && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => onToggle.mutate({ campaignId: campaign.id, action: 'resume' })}
              >
                <Play className="w-3 h-3 mr-1" />
                Resume
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
