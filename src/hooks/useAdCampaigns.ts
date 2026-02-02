import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdCampaign {
  id: string;
  advertiser_id: string;
  title: string;
  description: string;
  campaign_type: string;
  target_url: string;
  proof_type: string;
  reward_per_task: number;
  total_budget: number;
  remaining_budget: number;
  max_completions: number;
  current_completions: number;
  status: string;
  required_level: string;
  is_featured: boolean;
  created_at: string;
  approved_at: string | null;
  expires_at: string | null;
}

export interface CreateCampaignInput {
  title: string;
  description: string;
  campaign_type: string;
  target_url: string;
  proof_type: string;
  reward_per_task: number;
  total_budget: number;
  max_completions: number;
  required_level?: string;
  expires_days?: number;
}

export function useAdCampaigns() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's own campaigns
  const { data: myCampaigns, isLoading: isLoadingMyCampaigns, refetch: refetchMyCampaigns } = useQuery({
    queryKey: ['my-ad-campaigns'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .eq('advertiser_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdCampaign[];
    },
  });

  // Fetch active campaigns in marketplace
  const { data: marketplaceCampaigns, isLoading: isLoadingMarketplace } = useQuery({
    queryKey: ['marketplace-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdCampaign[];
    },
  });

  // Create campaign mutation
  const createCampaign = useMutation({
    mutationFn: async (input: CreateCampaignInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('create_ad_campaign', {
        p_user_id: user.id,
        p_title: input.title,
        p_description: input.description,
        p_campaign_type: input.campaign_type,
        p_target_url: input.target_url,
        p_proof_type: input.proof_type,
        p_reward_per_task: input.reward_per_task,
        p_total_budget: input.total_budget,
        p_max_completions: input.max_completions,
        p_required_level: input.required_level || 'pro',
        p_expires_days: input.expires_days || 30,
      });

      if (error) throw error;
      
      const result = data as { success: boolean; error?: string; campaign_id?: string };
      if (!result.success) {
        throw new Error(result.error || 'Failed to create campaign');
      }

      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Campaign Created! 🚀",
        description: "Your ad campaign is pending approval.",
      });
      queryClient.invalidateQueries({ queryKey: ['my-ad-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Campaign Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Pause/Resume campaign
  const toggleCampaignStatus = useMutation({
    mutationFn: async ({ campaignId, action }: { campaignId: string; action: 'pause' | 'resume' }) => {
      const newStatus = action === 'pause' ? 'paused' : 'active';
      
      const { error } = await supabase
        .from('ad_campaigns')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', campaignId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.action === 'pause' ? "Campaign Paused" : "Campaign Resumed",
        description: variables.action === 'pause' 
          ? "Your campaign has been paused." 
          : "Your campaign is now active.",
      });
      queryClient.invalidateQueries({ queryKey: ['my-ad-campaigns'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    myCampaigns,
    marketplaceCampaigns,
    isLoadingMyCampaigns,
    isLoadingMarketplace,
    createCampaign,
    toggleCampaignStatus,
    refetchMyCampaigns,
  };
}

// Campaign type options
export const CAMPAIGN_TYPES = [
  { value: 'youtube_watch', label: 'YouTube Watch', icon: '▶️' },
  { value: 'youtube_subscribe', label: 'YouTube Subscribe', icon: '🔔' },
  { value: 'facebook_like', label: 'Facebook Like', icon: '👍' },
  { value: 'instagram_follow', label: 'Instagram Follow', icon: '📸' },
  { value: 'tiktok_follow', label: 'TikTok Follow', icon: '🎵' },
  { value: 'twitter_follow', label: 'Twitter/X Follow', icon: '𝕏' },
  { value: 'website_traffic', label: 'Website Traffic', icon: '🌐' },
  { value: 'app_download', label: 'App Download', icon: '📱' },
  { value: 'social_engagement', label: 'Social Engagement', icon: '💬' },
];

export const PROOF_TYPES = [
  { value: 'screenshot', label: 'Screenshot' },
  { value: 'video', label: 'Video Recording' },
  { value: 'text', label: 'Text Description' },
];
