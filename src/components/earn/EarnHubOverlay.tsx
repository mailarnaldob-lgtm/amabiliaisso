/**
 * EARN HUB OVERLAY - SOVEREIGN V12.1
 * Complete database-driven mission marketplace
 * 
 * Architecture:
 * - Fetches from `tasks` table (database source of truth)
 * - RESTful polling (15-second intervals) via useMissionHub
 * - Tier-based visibility (PRO, EXPERT, ELITE)
 * - Standard Supabase storage for proof uploads
 * - AnimatedOdometers for reward figures
 * 
 * Theme: Obsidian Black (#050505) + Alpha Gold (#FFD700)
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Target, CheckCircle2, Clock, Award, Zap, 
  ExternalLink, FileCheck, AlertCircle, Star,
  Youtube, Facebook, Users, Music, Camera, Lock, Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EliteButton } from '@/components/ui/elite-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTaskSubmissions, useTaskStats } from '@/hooks/useTasks';
import { useFilteredMissions, getPlatformFromCategory, DatabaseMission, MissionPlatform } from '@/hooks/useMissionHub';
import { useProfile } from '@/hooks/useProfile';
import { ARMY_LEVELS } from '@/stores/appStore';
import { formatDistanceToNow } from 'date-fns';
import { OdometerNumber } from '@/components/command/OdometerNumber';
import { TaskSubmissionModal } from '@/components/alpha/TaskSubmissionModal';

interface EarnHubOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATS HEADER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function StatsHeader({ stats }: { stats: ReturnType<typeof useTaskStats> }) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      <Card className="bg-[#050505]/60 border-[#FFD700]/20">
        <CardContent className="p-3 text-center">
          <p className="text-xs text-zinc-500 mb-1">Available</p>
          <div className="flex items-center justify-center gap-1">
            <Target className="h-4 w-4 text-[#FFD700]" />
            <OdometerNumber 
              value={40 - stats.totalCompleted} 
              className="text-lg font-bold text-[#FFD700]" 
            />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-[#050505]/60 border-blue-500/20">
        <CardContent className="p-3 text-center">
          <p className="text-xs text-zinc-500 mb-1">Pending</p>
          <div className="flex items-center justify-center gap-1">
            <Clock className="h-4 w-4 text-blue-400" />
            <OdometerNumber 
              value={stats.totalPending} 
              className="text-lg font-bold text-blue-400" 
            />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-[#050505]/60 border-emerald-500/20">
        <CardContent className="p-3 text-center">
          <p className="text-xs text-zinc-500 mb-1">Earned</p>
          <div className="flex items-center justify-center gap-1">
            <Zap className="h-4 w-4 text-emerald-400" />
            <OdometerNumber 
              value={stats.totalCreditsEarned} 
              prefix="₳" 
              className="text-lg font-bold text-emerald-400" 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BUSINESS LOGIC SECTION
// ═══════════════════════════════════════════════════════════════════════════

function BusinessLogicSection() {
  return (
    <Alert className="border-[#FFD700]/20 bg-[#FFD700]/5">
      <AlertCircle className="h-4 w-4 text-[#FFD700]" />
      <AlertDescription className="text-xs text-zinc-300">
        <strong className="text-[#FFD700]">How It Works:</strong> Complete social missions → 
        Upload proof → Admin reviews → ₳ credits your wallet automatically.
        <span className="block mt-1 text-zinc-500">
          PRO members earn full rewards. EXPERT/ELITE unlock premium missions.
        </span>
      </AlertDescription>
    </Alert>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VPA LEVEL CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function VPALevelCard({ completedCount }: { completedCount: number }) {
  const armyLevel = completedCount >= 100 ? 'elite_operator'
    : completedCount >= 50 ? 'operative'
    : completedCount >= 10 ? 'specialist'
    : 'cadet';
    
  const levelInfo = ARMY_LEVELS[armyLevel];
  const nextLevel = Object.entries(ARMY_LEVELS).find(
    ([_, info]) => info.minTasks > levelInfo.minTasks
  );

  const progressToNext = nextLevel
    ? Math.min(100, (completedCount / nextLevel[1].minTasks) * 100)
    : 100;

  return (
    <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#050505] border-[#FFD700]/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FFD700]/20 border border-[#FFD700]/30 flex items-center justify-center text-2xl">
              {levelInfo.icon}
            </div>
            <div>
              <h3 className="font-bold text-white">{levelInfo.name}</h3>
              <p className="text-xs text-zinc-500">VPA Level</p>
            </div>
          </div>
          <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30">
            <Award className="h-3 w-3 mr-1" />
            {completedCount} Completed
          </Badge>
        </div>

        {nextLevel && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">
                Progress to {nextLevel[1].name}
              </span>
              <span className="text-[#FFD700] font-mono">
                {completedCount}/{nextLevel[1].minTasks}
              </span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PLATFORM ICON HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const getPlatformIcon = (category: string) => {
  const platform = getPlatformFromCategory(category);
  switch (platform) {
    case 'youtube': return Youtube;
    case 'facebook': return Facebook;
    case 'tiktok': return Music;
    case 'instagram': return Camera;
    default: return Briefcase;
  }
};

const platformConfig: Record<MissionPlatform, { bg: string; color: string; actionBg: string }> = {
  youtube: {
    bg: 'from-red-600/20 to-red-800/10 border-red-500/20',
    color: 'text-red-500',
    actionBg: 'bg-red-500/5 border-red-500/20 text-red-400',
  },
  facebook: {
    bg: 'from-blue-600/20 to-blue-800/10 border-blue-500/20',
    color: 'text-blue-500',
    actionBg: 'bg-blue-500/5 border-blue-500/20 text-blue-400',
  },
  tiktok: {
    bg: 'from-cyan-400/20 to-pink-500/10 border-cyan-400/20',
    color: 'text-cyan-400',
    actionBg: 'bg-cyan-500/5 border-cyan-500/20 text-cyan-400',
  },
  instagram: {
    bg: 'from-pink-500/20 to-purple-600/10 border-pink-500/20',
    color: 'text-pink-500',
    actionBg: 'bg-pink-500/5 border-pink-500/20 text-pink-400',
  },
  other: {
    bg: 'from-zinc-600/20 to-zinc-800/10 border-zinc-500/20',
    color: 'text-zinc-400',
    actionBg: 'bg-zinc-500/5 border-zinc-500/20 text-zinc-400',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// DATABASE MISSION CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function DatabaseMissionCard({ 
  mission, 
  onStartMission,
  isSubmitted,
  isAccountInactive,
  onActivateClick
}: { 
  mission: DatabaseMission; 
  onStartMission: (mission: DatabaseMission) => void;
  isSubmitted: boolean;
  isAccountInactive?: boolean;
  onActivateClick?: () => void;
}) {
  const platform = getPlatformFromCategory(mission.category);
  const config = platformConfig[platform];
  const IconComponent = getPlatformIcon(mission.category);
  
  const isLocked = isAccountInactive && !isSubmitted;
  
  return (
    <Card className={cn(
      "bg-[#050505]/80 border-[#FFD700]/10 transition-all duration-300 backdrop-blur-xl group relative",
      isSubmitted ? "opacity-50" : isLocked ? "opacity-70" : "hover:border-[#FFD700]/40"
    )}>
      {/* Lock overlay for inactive accounts */}
      {isLocked && (
        <div className="absolute inset-0 bg-[#050505]/60 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="p-2 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/30 w-fit mx-auto mb-2">
              <Lock className="h-5 w-5 text-[#FFD700]" />
            </div>
            <p className="text-xs text-zinc-400 mb-2">Activation required to earn ₳ from missions.</p>
            <button
              onClick={onActivateClick}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:opacity-90 transition-opacity"
            >
              ACTIVATE ACCOUNT TO EARN ₳
            </button>
          </div>
        </div>
      )}
      
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3 rounded-xl bg-gradient-to-br border transition-colors",
            config.bg,
            !isSubmitted && !isLocked && "group-hover:border-[#FFD700]/40"
          )}>
            <IconComponent className={cn("h-6 w-6", config.color)} />
          </div>
          
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-white line-clamp-1">{mission.title}</h4>
                  {isSubmitted && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                      <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                      Done
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{mission.description}</p>
              </div>
              <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30 font-mono flex-shrink-0">
                <OdometerNumber value={mission.reward} prefix="+₳" className="text-xs" />
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className={cn("px-2 py-0.5 rounded border capitalize", config.actionBg)}>
                  {mission.category}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="capitalize">{mission.proof_type}</span>
              </div>
              
              {!isSubmitted && !isLocked && (
                <EliteButton
                  size="sm"
                  className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-semibold hover:opacity-90 h-8"
                  onClick={() => onStartMission(mission)}
                >
                  <Target className="h-3.5 w-3.5 mr-1" />
                  Start
                </EliteButton>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUBMISSION HISTORY CARD
// ═══════════════════════════════════════════════════════════════════════════

function SubmissionCard({ submission }: { submission: any }) {
  const statusConfig = {
    pending: { icon: Clock, label: 'Under Review', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    approved: { icon: CheckCircle2, label: 'Approved', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    rejected: { icon: AlertCircle, label: 'Rejected', bg: 'bg-red-500/10', border: 'border-red-500/30' }
  };
  
  const config = statusConfig[submission.status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;
  const timeAgo = formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true });
  
  return (
    <Card className={cn("bg-[#050505]/80 backdrop-blur-xl transition-all", config.border)}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("p-2.5 rounded-lg", config.bg)}>
            <Icon className={cn(
              "h-5 w-5",
              submission.status === 'approved' && "text-emerald-400",
              submission.status === 'pending' && "text-blue-400",
              submission.status === 'rejected' && "text-red-400"
            )} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-white line-clamp-1">
                  {submission.task?.title || 'Mission'}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">Submitted {timeAgo}</p>
              </div>
              <Badge className={cn(
                "text-xs flex-shrink-0",
                submission.status === 'approved' && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                submission.status === 'pending' && "bg-blue-500/20 text-blue-400 border-blue-500/30",
                submission.status === 'rejected' && "bg-red-500/20 text-red-400 border-red-500/30"
              )}>
                {config.label}
              </Badge>
            </div>
            
            {submission.status === 'approved' && submission.reward_amount && (
              <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
                <Zap className="h-3 w-3" />
                <span>+₳{submission.reward_amount} credited</span>
              </div>
            )}
            
            {submission.status === 'rejected' && submission.rejection_reason && (
              <p className="mt-2 text-xs text-red-400">Reason: {submission.rejection_reason}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EMPTY STATE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-[#050505]/60 border-[#FFD700]/10">
      <CardContent className="p-8 text-center">
        <div className="mx-auto text-zinc-600 mb-3">{icon}</div>
        <p className="font-medium text-white">{title}</p>
        <p className="text-xs text-zinc-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EARN HUB OVERLAY COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function EarnHubOverlay({ isOpen, onClose }: EarnHubOverlayProps) {
  const { data: profile } = useProfile();
  const { data: submissions, isLoading: submissionsLoading, refetch: refetchSubmissions } = useTaskSubmissions();
  const stats = useTaskStats();
  
  // Database-driven missions with 15-second polling
  const { 
    missions, 
    availableMissions, 
    submittedTaskIds, 
    platformCounts, 
    totalPotentialEarnings,
    totalMissions,
    isLoading: missionsLoading,
    refetch: refetchMissions 
  } = useFilteredMissions();
  
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | MissionPlatform>('all');
  const [selectedMission, setSelectedMission] = useState<DatabaseMission | null>(null);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);

  // Check if account is inactive (no membership_tier)
  const isAccountInactive = !profile?.membership_tier;

  // Handler to redirect to activation flow
  const handleActivateClick = useCallback(() => {
    onClose();
  }, [onClose]);

  // 15-second RESTful polling for live data (NO WebSockets)
  useEffect(() => {
    if (!isOpen) return;
    
    const pollInterval = setInterval(() => {
      refetchSubmissions();
      refetchMissions();
    }, 15000);
    
    return () => clearInterval(pollInterval);
  }, [isOpen, refetchSubmissions, refetchMissions]);

  // Filter missions by platform
  const filteredMissions = selectedPlatform === 'all' 
    ? missions 
    : missions?.filter(m => getPlatformFromCategory(m.category) === selectedPlatform) || [];

  const handleStartMission = useCallback((mission: DatabaseMission) => {
    setSelectedMission(mission);
    setSubmissionModalOpen(true);
  }, []);

  const isLoading = submissionsLoading || missionsLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur - Obsidian Black theme */}
          <motion.div
            className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          
          {/* Overlay Content - Scale-in animation */}
          <motion.div
            className="fixed inset-0 z-50 overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="min-h-screen px-4 py-6 max-w-2xl mx-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#FFA500]">
                    <Star className="h-6 w-6 text-black" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">EARN Hub</h1>
                    <p className="text-xs text-zinc-500">VPA Mission Control • {totalMissions} Active Missions</p>
                  </div>
                </div>
                
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-full bg-[#FFD700]/10 hover:bg-[#FFD700]/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="h-5 w-5 text-[#FFD700]" />
                </motion.button>
              </div>
              
              {/* Mission Counter Banner - ALL 4 PLATFORMS */}
              <Alert className="border-[#FFD700]/30 bg-[#FFD700]/5 mb-4">
                <FileCheck className="h-4 w-4 text-[#FFD700]" />
                <AlertDescription className="text-xs text-zinc-300">
                  <span className="text-[#FFD700] font-semibold">{totalMissions} Active Missions</span> • 
                  <span className="text-blue-400"> {platformCounts.facebook} FB</span> • 
                  <span className="text-red-400"> {platformCounts.youtube} YT</span> • 
                  <span className="text-cyan-400"> {platformCounts.tiktok} TikTok</span> • 
                  <span className="text-pink-400"> {platformCounts.instagram} IG</span> • 
                  Total: <span className="text-[#FFD700] font-mono">₳{totalPotentialEarnings}</span>
                </AlertDescription>
              </Alert>
              
              {/* Stats Header with Odometers */}
              <StatsHeader stats={stats} />
              
              {/* VPA Level Card */}
              <div className="mt-4">
                <VPALevelCard completedCount={stats.totalCompleted} />
              </div>
              
              {/* Business Logic Section */}
              <div className="mt-4">
                <BusinessLogicSection />
              </div>
              
              {/* Platform Filter Tabs - 4 PLATFORMS */}
              <div className="flex flex-wrap gap-2 mt-6 mb-4">
                <button
                  onClick={() => setSelectedPlatform('all')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all",
                    selectedPlatform === 'all'
                      ? 'bg-[#FFD700] text-black'
                      : 'bg-[#FFD700]/10 text-zinc-400 hover:text-white hover:bg-[#FFD700]/20'
                  )}
                >
                  <Users className="h-3.5 w-3.5" />
                  All ({totalMissions})
                </button>
                <button
                  onClick={() => setSelectedPlatform('facebook')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all",
                    selectedPlatform === 'facebook'
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-500/10 text-blue-400 hover:text-white hover:bg-blue-500/20'
                  )}
                >
                  <Facebook className="h-3.5 w-3.5" />
                  FB ({platformCounts.facebook})
                </button>
                <button
                  onClick={() => setSelectedPlatform('youtube')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all",
                    selectedPlatform === 'youtube'
                      ? 'bg-red-500 text-white'
                      : 'bg-red-500/10 text-red-400 hover:text-white hover:bg-red-500/20'
                  )}
                >
                  <Youtube className="h-3.5 w-3.5" />
                  YT ({platformCounts.youtube})
                </button>
                <button
                  onClick={() => setSelectedPlatform('tiktok')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all",
                    selectedPlatform === 'tiktok'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-cyan-500/10 text-cyan-400 hover:text-white hover:bg-cyan-500/20'
                  )}
                >
                  <Music className="h-3.5 w-3.5" />
                  TikTok ({platformCounts.tiktok})
                </button>
                <button
                  onClick={() => setSelectedPlatform('instagram')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all",
                    selectedPlatform === 'instagram'
                      ? 'bg-pink-500 text-white'
                      : 'bg-pink-500/10 text-pink-400 hover:text-white hover:bg-pink-500/20'
                  )}
                >
                  <Camera className="h-3.5 w-3.5" />
                  IG ({platformCounts.instagram})
                </button>
              </div>
              
              {/* Tabs for Missions vs History */}
              <Tabs defaultValue="missions" className="w-full">
                <TabsList className="w-full grid grid-cols-2 bg-[#050505]/60 border border-[#FFD700]/20 rounded-xl mb-4">
                  <TabsTrigger 
                    value="missions" 
                    className="rounded-lg data-[state=active]:bg-[#FFD700] data-[state=active]:text-black"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Missions
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history"
                    className="rounded-lg data-[state=active]:bg-[#FFD700] data-[state=active]:text-black"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    History ({submissions?.length || 0})
                  </TabsTrigger>
                </TabsList>
                
                {/* Missions Tab */}
                <TabsContent value="missions" className="space-y-3 mt-0">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Card key={i} className="bg-[#050505]/80 border-[#FFD700]/10">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <Skeleton className="h-12 w-12 rounded-xl" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-2/3" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : filteredMissions.length > 0 ? (
                    <>
                      {/* Inactive Account Warning Banner */}
                      {isAccountInactive && (
                        <Alert className="border-[#FFD700]/50 bg-[#FFD700]/10 mb-4">
                          <Lock className="h-4 w-4 text-[#FFD700]" />
                          <AlertDescription className="text-xs text-[#FFD700]">
                            <strong>Account Inactive:</strong> Activate your account to start earning ₳ from missions.{' '}
                            <button 
                              onClick={handleActivateClick} 
                              className="underline hover:text-white transition-colors"
                            >
                              Activate Now →
                            </button>
                          </AlertDescription>
                        </Alert>
                      )}
                      {filteredMissions.map((mission) => (
                        <DatabaseMissionCard
                          key={mission.id}
                          mission={mission}
                          onStartMission={handleStartMission}
                          isSubmitted={submittedTaskIds.has(mission.id)}
                          isAccountInactive={isAccountInactive}
                          onActivateClick={handleActivateClick}
                        />
                      ))}
                    </>
                  ) : (
                    <EmptyState
                      icon={<Target className="h-12 w-12" />}
                      title="No Missions Available"
                      description="Check back later for new missions"
                    />
                  )}
                </TabsContent>
                
                {/* History Tab */}
                <TabsContent value="history" className="space-y-3 mt-0">
                  {submissionsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i} className="bg-[#050505]/80 border-[#FFD700]/10">
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            <Skeleton className="h-10 w-10 rounded-lg" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-3 w-1/2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : submissions && submissions.length > 0 ? (
                    submissions.map((submission) => (
                      <SubmissionCard key={submission.id} submission={submission} />
                    ))
                  ) : (
                    <EmptyState
                      icon={<Clock className="h-12 w-12" />}
                      title="No Submissions Yet"
                      description="Complete missions to see your history"
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
          
          {/* Task Submission Modal */}
          {selectedMission && (
            <TaskSubmissionModal
              open={submissionModalOpen}
              onOpenChange={(open) => {
                setSubmissionModalOpen(open);
                if (!open) setSelectedMission(null);
              }}
              task={{
                id: selectedMission.id,
                title: selectedMission.title,
                description: selectedMission.description,
                category: selectedMission.category,
                required_level: selectedMission.required_level,
                proof_type: selectedMission.proof_type,
                reward: selectedMission.reward,
                is_active: selectedMission.is_active,
                created_at: selectedMission.created_at,
              }}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}

// Re-export types for compatibility
export type { MissionPlatform, DatabaseMission as PhilippineMission };
