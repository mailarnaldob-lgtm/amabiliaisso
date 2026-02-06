/**
 * MISSION CONTROL WIDGET - SOVEREIGN V12.0
 * Dashboard integration for real-time mission display
 * 
 * Architecture:
 * - 15-second RESTful polling (shared with EarnHubOverlay)
 * - AnimatedOdometers for reward amounts
 * - Click-to-expand triggers EARN overlay
 * - Theme: Obsidian Black (#050505) + Alpha Gold (#FFD700)
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, Zap, ArrowRight, ExternalLink,
  Youtube, Star, Users, Camera, Music
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { OdometerNumber } from '@/components/command/OdometerNumber';
import { PHILIPPINE_MISSIONS, PhilippineMission, MissionPlatform } from '@/components/earn/EarnHubOverlay';

interface MissionControlWidgetProps {
  onOpenEarnHub?: () => void;
}

// Platform icon mapping
const getPlatformIcon = (platform: MissionPlatform) => {
  switch (platform) {
    case 'youtube': return Youtube;
    case 'facebook': return Users;
    case 'tiktok': return Music;
    case 'instagram': return Camera;
    default: return Star;
  }
};

// Platform color mapping
const getPlatformStyle = (platform: MissionPlatform) => {
  switch (platform) {
    case 'youtube': return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-400' };
    case 'facebook': return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400' };
    case 'tiktok': return { bg: 'bg-pink-500/10', border: 'border-pink-500/20', text: 'text-pink-400' };
    case 'instagram': return { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' };
    default: return { bg: 'bg-muted/30', border: 'border-border', text: 'text-muted-foreground' };
  }
};

export function MissionControlWidget({ onOpenEarnHub }: MissionControlWidgetProps) {
  const [missions, setMissions] = useState<PhilippineMission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [totalRewardPool, setTotalRewardPool] = useState(0);

  // 15-second RESTful polling for mission updates
  const fetchMissions = useCallback(() => {
    // Get top 5 highest-paying active missions
    const activeMissions = PHILIPPINE_MISSIONS
      .filter(m => m.is_active)
      .sort((a, b) => b.reward - a.reward)
      .slice(0, 5);
    
    const allActive = PHILIPPINE_MISSIONS.filter(m => m.is_active);
    const rewardPool = allActive.reduce((sum, m) => sum + m.reward, 0);
    
    setMissions(activeMissions);
    setTotalAvailable(allActive.length);
    setTotalRewardPool(rewardPool);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchMissions();
    
    // 15-second polling interval
    const pollInterval = setInterval(fetchMissions, 15000);
    
    return () => clearInterval(pollInterval);
  }, [fetchMissions]);

  const handleMissionClick = (mission: PhilippineMission) => {
    // Open external target in new tab
    window.open(mission.target_url, '_blank', 'noopener,noreferrer');
    
    // Optionally trigger the EARN overlay for proof submission
    if (onOpenEarnHub) {
      onOpenEarnHub();
    }
  };

  if (isLoading) {
    return (
      <div className="p-5 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden rounded-xl",
        "bg-card border border-border",
        "hover:border-[#FFD700]/30 transition-colors"
      )}
    >
      {/* Ambient glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/20">
              <Target className="h-5 w-5 text-[#FFD700]" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Mission Control</h3>
              <p className="text-xs text-muted-foreground">
                <span className="text-[#FFD700] font-mono">{totalAvailable}</span> active assignments
              </p>
            </div>
          </div>
          
          {/* Animated reward pool */}
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <span className="text-xs text-muted-foreground">Pool:</span>
              <span className="text-[#FFD700] font-bold font-mono text-lg">₳</span>
              <OdometerNumber value={totalRewardPool} className="text-[#FFD700] font-bold text-lg" />
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {(['facebook', 'youtube', 'tiktok', 'instagram'] as MissionPlatform[]).map((platform) => {
            const count = PHILIPPINE_MISSIONS.filter(m => m.category === platform && m.is_active).length;
            const style = getPlatformStyle(platform);
            const Icon = getPlatformIcon(platform);
            return (
              <div 
                key={platform}
                className={cn(
                  "p-2 rounded-lg text-center",
                  style.bg, "border", style.border
                )}
              >
                <Icon className={cn("h-4 w-4 mx-auto mb-1", style.text)} />
                <span className="text-xs font-mono font-bold text-foreground">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Top 5 Missions */}
        <div className="space-y-2 mb-4">
          {missions.map((mission, index) => {
            const style = getPlatformStyle(mission.category);
            const Icon = getPlatformIcon(mission.category);
            
            return (
              <motion.button
                key={mission.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                onClick={() => handleMissionClick(mission)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg",
                  "bg-muted/20 border border-border/50",
                  "hover:bg-muted/40 hover:border-[#FFD700]/30",
                  "transition-all duration-200 group text-left"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                    style.bg, "border", style.border
                  )}>
                    <Icon className={cn("h-4 w-4", style.text)} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-[#FFD700] transition-colors">
                      {mission.brand}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{mission.action}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge 
                    variant="outline" 
                    className="border-[#FFD700]/30 text-[#FFD700] font-mono text-xs"
                  >
                    <span className="mr-0.5">+₳</span>
                    <OdometerNumber value={mission.reward} className="inline" />
                  </Badge>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* CTA Button */}
        <Button
          onClick={onOpenEarnHub}
          className={cn(
            "w-full gap-2",
            "bg-gradient-to-r from-[#FFD700] to-[#FFA500]",
            "text-black font-bold",
            "hover:opacity-90 haptic-press",
            "shadow-lg shadow-[#FFD700]/20"
          )}
        >
          <Zap className="h-4 w-4" />
          View All Assignments
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
