/**
 * MISSION HUB HOOK - SOVEREIGN V12.0
 * 
 * Unified data layer for Mission Control & EARN Hub synchronization.
 * - Fetches from `tasks` table (database source of truth)
 * - 15-second RESTful polling (NO WebSockets)
 * - Smart filtering by tier, completion status, and expiry
 * - Tier-based visibility (PRO, EXPERT, ELITE)
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useTaskSubmissions } from '@/hooks/useTasks';

export interface DatabaseMission {
  id: string;
  title: string;
  description: string;
  category: string;
  required_level: string;
  proof_type: string;
  reward: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type MissionPlatform = 'facebook' | 'youtube' | 'tiktok' | 'instagram' | 'other';

// Map category strings to platform types
export function getPlatformFromCategory(category: string): MissionPlatform {
  const cat = category.toLowerCase();
  if (cat.includes('facebook') || cat === 'fb') return 'facebook';
  if (cat.includes('youtube') || cat === 'yt') return 'youtube';
  if (cat.includes('tiktok')) return 'tiktok';
  if (cat.includes('instagram') || cat === 'ig') return 'instagram';
  return 'other';
}

// Tier hierarchy for visibility checks
const TIER_HIERARCHY: Record<string, number> = {
  basic: 0,
  pro: 1,
  expert: 2,
  elite: 3,
};

/**
 * Fetch all active missions from database with 15-second polling
 */
export function useMissions() {
  return useQuery({
    queryKey: ['missions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DatabaseMission[];
    },
    refetchInterval: 15000, // 15-second polling per Blueprint V8.0
    staleTime: 10000,
  });
}

/**
 * Get missions filtered by user's tier (visibility logic)
 */
export function useFilteredMissions() {
  const { data: missions, isLoading, refetch } = useMissions();
  const { data: profile } = useProfile();
  const { data: submissions } = useTaskSubmissions();
  
  const userTier = profile?.membership_tier || 'basic';
  const userTierLevel = TIER_HIERARCHY[userTier] || 0;
  
  // Get IDs of already submitted tasks
  const submittedTaskIds = new Set(submissions?.map(s => s.task_id) || []);
  
  // Filter missions based on tier visibility
  const visibleMissions = missions?.filter(mission => {
    const requiredLevel = TIER_HIERARCHY[mission.required_level] || 1;
    return userTierLevel >= requiredLevel;
  }) || [];
  
  // Separate available vs completed missions
  const availableMissions = visibleMissions.filter(m => !submittedTaskIds.has(m.id));
  const completedMissions = visibleMissions.filter(m => submittedTaskIds.has(m.id));
  
  // Platform counts
  const platformCounts = {
    facebook: visibleMissions.filter(m => getPlatformFromCategory(m.category) === 'facebook').length,
    youtube: visibleMissions.filter(m => getPlatformFromCategory(m.category) === 'youtube').length,
    tiktok: visibleMissions.filter(m => getPlatformFromCategory(m.category) === 'tiktok').length,
    instagram: visibleMissions.filter(m => getPlatformFromCategory(m.category) === 'instagram').length,
    other: visibleMissions.filter(m => getPlatformFromCategory(m.category) === 'other').length,
  };
  
  // Total potential earnings
  const totalPotentialEarnings = availableMissions.reduce((sum, m) => sum + m.reward, 0);
  
  return {
    missions: visibleMissions,
    availableMissions,
    completedMissions,
    submittedTaskIds,
    platformCounts,
    totalPotentialEarnings,
    totalMissions: visibleMissions.length,
    isLoading,
    refetch,
    userTier,
  };
}

/**
 * Get Top N missions for Mission Control Widget
 * Prioritizes: highest reward, newest, not completed by user
 */
export function useTopMissions(limit: number = 5) {
  const { availableMissions, isLoading, submittedTaskIds, platformCounts, totalPotentialEarnings } = useFilteredMissions();
  
  // Sort by reward (descending), then by created_at (newest first)
  const topMissions = [...(availableMissions || [])]
    .sort((a, b) => {
      if (b.reward !== a.reward) return b.reward - a.reward;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .slice(0, limit);
  
  return {
    topMissions,
    totalAvailable: availableMissions.length,
    totalRewardPool: totalPotentialEarnings,
    platformCounts,
    isLoading,
  };
}

/**
 * Filter missions by platform
 */
export function useMissionsByPlatform(platform: MissionPlatform | 'all') {
  const { missions, availableMissions, submittedTaskIds, isLoading, refetch } = useFilteredMissions();
  
  if (platform === 'all') {
    return { missions, availableMissions, submittedTaskIds, isLoading, refetch };
  }
  
  const filteredMissions = missions?.filter(m => getPlatformFromCategory(m.category) === platform) || [];
  const filteredAvailable = availableMissions?.filter(m => getPlatformFromCategory(m.category) === platform) || [];
  
  return {
    missions: filteredMissions,
    availableMissions: filteredAvailable,
    submittedTaskIds,
    isLoading,
    refetch,
  };
}
