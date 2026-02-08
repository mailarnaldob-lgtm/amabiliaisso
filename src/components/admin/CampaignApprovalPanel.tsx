import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CAMPAIGN_TYPES } from '@/hooks/useAdCampaigns';
import { 
  Megaphone, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Clock,
  Loader2,
  Eye,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface PendingCampaign {
  id: string;
  advertiser_id: string;
  title: string;
  description: string;
  campaign_type: string;
  target_url: string;
  proof_type: string;
  reward_per_task: number;
  total_budget: number;
  max_completions: number;
  required_level: string;
  created_at: string;
  expires_at: string | null;
  advertiser?: {
    full_name: string;
    membership_tier: string;
  };
}

export function CampaignApprovalPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCampaign, setSelectedCampaign] = useState<PendingCampaign | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // Fetch pending campaigns with 15-second polling
  const { data: pendingCampaigns, isLoading } = useQuery({
    queryKey: ['admin-pending-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch advertiser details
      const campaignsWithAdvertisers = await Promise.all(
        (data || []).map(async (campaign) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, membership_tier')
            .eq('id', campaign.advertiser_id)
            .single();
          
          return {
            ...campaign,
            advertiser: profile || { full_name: 'Unknown', membership_tier: 'pro' }
          };
        })
      );

      return campaignsWithAdvertisers as PendingCampaign[];
    },
    refetchInterval: 15000, // 15-second polling per Blueprint V8.0
    staleTime: 10000,
  });

  // Approve campaign mutation using atomic RPC
  const approveCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('admin_approve_campaign', {
        p_campaign_id: campaignId,
        p_admin_id: user.id
      });

      if (error) throw new Error(error.message);
      
      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Approval failed');
      }
      
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Campaign Approved ✅",
        description: "The campaign is now live in the marketplace.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-campaigns'] });
      setSelectedCampaign(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reject campaign mutation using atomic RPC with refund
  const rejectCampaign = useMutation({
    mutationFn: async ({ campaignId, reason }: { campaignId: string; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('admin_reject_campaign', {
        p_campaign_id: campaignId,
        p_admin_id: user.id,
        p_reason: reason
      });

      if (error) throw new Error(error.message);
      
      const result = data as { success: boolean; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Rejection failed');
      }
      
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Campaign Rejected",
        description: "The campaign has been rejected and budget refunded.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-campaigns'] });
      setSelectedCampaign(null);
      setShowRejectDialog(false);
      setRejectReason('');
    },
    onError: (error: Error) => {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getCampaignTypeInfo = (type: string) => {
    return CAMPAIGN_TYPES.find(t => t.value === type) || { label: type, icon: '📢' };
  };

  if (isLoading) {
    return (
      <Card className="border-amber-500/20 bg-gradient-to-br from-card to-amber-500/5">
        <CardContent className="p-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-amber-500/20 bg-gradient-to-br from-card to-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-mono">
            <Megaphone className="h-6 w-6 text-amber-500" />
            Ad Campaign Approvals
            {pendingCampaigns && pendingCampaigns.length > 0 && (
              <Badge className="bg-amber-500 text-black">
                {pendingCampaigns.length} Pending
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!pendingCampaigns || pendingCampaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500/50" />
              <p>No pending campaigns to review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingCampaigns.map((campaign) => {
                const typeInfo = getCampaignTypeInfo(campaign.campaign_type);
                return (
                  <div
                    key={campaign.id}
                    className="p-4 rounded-xl border border-amber-500/20 bg-card/50 hover:border-amber-500/40 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{typeInfo.icon}</span>
                          <h4 className="font-semibold">{campaign.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {typeInfo.label}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {campaign.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span>
                            <strong className="text-foreground">Budget:</strong> ₳{campaign.total_budget}
                          </span>
                          <span>
                            <strong className="text-foreground">Reward:</strong> ₳{campaign.reward_per_task}/task
                          </span>
                          <span>
                            <strong className="text-foreground">Max:</strong> {campaign.max_completions} completions
                          </span>
                          <span>
                            <strong className="text-foreground">Advertiser:</strong> {campaign.advertiser?.full_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <a 
                            href={campaign.target_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Target URL
                          </a>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(campaign.created_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedCampaign(campaign)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedCampaign} onOpenChange={(open) => !open && setSelectedCampaign(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-amber-500" />
              Review Campaign
            </DialogTitle>
          </DialogHeader>

          {selectedCampaign && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs">Campaign Title</Label>
                <p className="font-semibold">{selectedCampaign.title}</p>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">Description</Label>
                <p className="text-sm">{selectedCampaign.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground text-xs">Type</Label>
                  <p>{getCampaignTypeInfo(selectedCampaign.campaign_type).label}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Proof Required</Label>
                  <p className="capitalize">{selectedCampaign.proof_type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Budget</Label>
                  <p className="text-primary font-bold">₳{selectedCampaign.total_budget}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Reward/Task</Label>
                  <p>₳{selectedCampaign.reward_per_task}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs">Target URL</Label>
                <a 
                  href={selectedCampaign.target_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  {selectedCampaign.target_url}
                </a>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    Approving will make this campaign visible to all VPA workers. 
                    Rejecting will refund the budget (minus 10% platform fee).
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(true);
              }}
              className="border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
            <Button
              onClick={() => selectedCampaign && approveCampaign.mutate(selectedCampaign.id)}
              disabled={approveCampaign.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveCampaign.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-1" />
              )}
              Approve Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Reason Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejection Reason</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Please provide a reason for rejection</Label>
              <Textarea
                placeholder="e.g., Target URL contains inappropriate content..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedCampaign && rejectCampaign.mutate({
                campaignId: selectedCampaign.id,
                reason: rejectReason || 'Campaign does not meet platform guidelines'
              })}
              disabled={rejectCampaign.isPending}
            >
              {rejectCampaign.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4 mr-1" />
              )}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
