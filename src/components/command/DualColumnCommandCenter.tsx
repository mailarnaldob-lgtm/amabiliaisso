import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { RadialProgressClock } from './RadialProgressClock';
import { OdometerNumber } from './OdometerNumber';
import { ExpandableCard } from './ExpandableCard';
 import { SocialIconGrid } from './SocialIconGrid';
import { AdPackageGrid } from './AdPackageGrid';
 import { AlphaMissionModal } from './AlphaMissionModal';
import { useTasks, useTaskSubmissions, useTaskStats, Task, TaskSubmission } from '@/hooks/useTasks';
import { useAdCampaigns, CAMPAIGN_TYPES, AdCampaign } from '@/hooks/useAdCampaigns';
import { useProfile } from '@/hooks/useProfile';
import { AdWizardModal } from '@/components/alpha/AdWizardModal';
import { TierGate } from '@/components/tier/TierGate';
import { formatAlpha, cn } from '@/lib/utils';
import { formatDistanceToNow, differenceInDays, differenceInHours } from 'date-fns';
import { 
  Target, 
  Megaphone, 
  Zap, 
  Plus,
  Clock,
  Users,
  Camera,
  Link as LinkIcon,
  FileCheck,
  Upload,
  Star,
  TrendingUp,
  Eye,
  Play,
  Pause,
   CheckCircle2,
   Sparkles,
   Flame,
   Award,
   AlertCircle,
   XCircle,
   Timer
} from 'lucide-react';

const POLL_INTERVAL = 15000; // 15 seconds

export function DualColumnCommandCenter() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
   const [missionModalOpen, setMissionModalOpen] = useState(false);
  const [adWizardOpen, setAdWizardOpen] = useState(false);
   const [filterPlatform, setFilterPlatform] = useState<string | null>(null);
  const [adPlatformFilter, setAdPlatformFilter] = useState<string | null>(null);

  // Data hooks
  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = useTasks();
  const { data: submissions, refetch: refetchSubmissions } = useTaskSubmissions();
  const { myCampaigns, isLoadingMyCampaigns, refetchMyCampaigns } = useAdCampaigns();
  const { data: profile } = useProfile();
  const taskStats = useTaskStats();

  const isPro = profile?.membership_tier === 'pro' || 
                profile?.membership_tier === 'expert' || 
                profile?.membership_tier === 'elite';

  // Get submitted task IDs
  const submittedTaskIds = useMemo(() => {
    return new Set(submissions?.map((s) => s.task_id) || []);
  }, [submissions]);

  // Filter available tasks
  const availableTasks = useMemo(() => {
    if (!tasks) return [];
    let filtered = tasks.filter((t) => !submittedTaskIds.has(t.id));
    
    // Apply platform filter if active
    if (filterPlatform) {
      const platformCategories: Record<string, string[]> = {
        'youtube': ['Video Engagement', 'video', 'youtube'],
        'facebook': ['Social Media', 'facebook', 'social'],
        'instagram': ['Content Creation', 'instagram', 'photo'],
        'tiktok': ['Content Creation', 'tiktok', 'video', 'short']
      };
      const keywords = platformCategories[filterPlatform] || [];
      filtered = filtered.filter((t) => 
        keywords.some(kw => 
          t.category.toLowerCase().includes(kw.toLowerCase()) ||
          t.title.toLowerCase().includes(kw.toLowerCase()) ||
          t.description.toLowerCase().includes(kw.toLowerCase())
        )
      );
    }
    
    return filtered.slice(0, 8);
  }, [tasks, submittedTaskIds, filterPlatform]);

  // Get pending submissions for tracking
  const pendingSubmissions = useMemo(() => {
    return submissions?.filter(s => s.status === 'pending') || [];
  }, [submissions]);

  // Active campaigns for display
  const activeCampaigns = useMemo(() => {
    return myCampaigns?.filter(c => 
      c.status === 'active' || c.status === 'pending'
    ).slice(0, 4) || [];
  }, [myCampaigns]);

  // Filter active campaigns by platform
  const filteredCampaigns = useMemo(() => {
    if (!adPlatformFilter) return activeCampaigns;
    const platformMappings: Record<string, string[]> = {
      'youtube': ['youtube_watch', 'youtube_subscribe'],
      'facebook': ['facebook_like', 'social_engagement'],
      'instagram': ['instagram_follow', 'social_engagement'],
      'tiktok': ['tiktok_follow', 'social_engagement']
    };
    const types = platformMappings[adPlatformFilter] || [];
    return activeCampaigns.filter(c => types.some(t => c.campaign_type.includes(t)));
  }, [activeCampaigns, adPlatformFilter]);

  // 15-second RESTful polling
  useEffect(() => {
    const controller = new AbortController();
    
    const poll = () => {
      refetchTasks();
      refetchSubmissions();
      refetchMyCampaigns();
    };

    const intervalId = setInterval(poll, POLL_INTERVAL);

    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, [refetchTasks, refetchSubmissions, refetchMyCampaigns]);

  const handleCardExpand = useCallback((cardId: string, expanded: boolean) => {
    setExpandedCard(expanded ? cardId : null);
  }, []);

  const handleStartTask = (task: Task) => {
    setSelectedTask(task);
     setMissionModalOpen(true);
  };

   const handlePlatformFilter = (platform: string) => {
     setFilterPlatform(filterPlatform === platform ? null : platform);
   };

  const handleAdPlatformFilter = (platform: string) => {
    setAdPlatformFilter(adPlatformFilter === platform ? null : platform);
  };
 
  // Calculate stats
  const totalMissions = availableTasks.length;
  const totalRewards = availableTasks.reduce((sum, t) => sum + t.reward, 0);
  const totalCampaigns = activeCampaigns.length;
  const totalReach = activeCampaigns.reduce((sum, c) => sum + c.current_completions, 0);

  return (
    <div className="space-y-6">
      {/* VPA Stats Dashboard - 3 Column */}
      <div className="grid grid-cols-3 gap-3">
        {/* Available Missions */}
        <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FFD700]/5 border-[#FFD700]/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#FFD700]/20 border border-[#FFD700]/30">
                <Target className="h-4 w-4 text-[#FFD700]" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Available</p>
                <OdometerNumber 
                  value={totalMissions} 
                  className="text-xl font-bold text-[#FFD700]"
                />
              </div>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Zap className="h-3 w-3 text-[#FFD700]" />
              <span>₳{totalRewards}</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Review */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-500/30">
                <Timer className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Pending</p>
                <OdometerNumber 
                  value={pendingSubmissions.length} 
                  className="text-xl font-bold text-blue-400"
                />
              </div>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3 text-blue-400" />
              <span>Under review</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Earned */}
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <Award className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Earned</p>
                <div className="text-xl font-bold text-emerald-400">
                  ₳<OdometerNumber value={taskStats.totalCreditsEarned} />
                </div>
              </div>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span>{taskStats.totalCompleted} approved</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Submissions Tracker */}
      {pendingSubmissions.length > 0 && (
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Timer className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-foreground">Pending Review</h3>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] ml-auto">
                {pendingSubmissions.length} awaiting
              </Badge>
            </div>
            <div className="space-y-2">
              {pendingSubmissions.slice(0, 3).map((sub) => (
                <PendingSubmissionCard key={sub.id} submission={sub} />
              ))}
              {pendingSubmissions.length > 3 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  +{pendingSubmissions.length - 3} more pending
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dual Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Mission Control Center */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[#FFD700]" />
              <h2 className="font-bold text-foreground">Mission Control Center</h2>
            </div>
            <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30">
              EARN ₳
            </Badge>
          </div>

           {/* Social Icon Grid Filter */}
           <div className="mb-4">
             <SocialIconGrid onSelect={handlePlatformFilter} activeFilter={filterPlatform} />
             {filterPlatform && (
               <motion.div 
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="mt-3 flex items-center justify-between"
               >
                 <Badge 
                   className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30"
                 >
                   {filterPlatform.charAt(0).toUpperCase() + filterPlatform.slice(1)} Missions
                 </Badge>
                 <Button
                   variant="ghost"
                   size="sm"
                   className="h-7 text-xs text-muted-foreground hover:text-foreground"
                   onClick={() => setFilterPlatform(null)}
                 >
                   Clear Filter
                 </Button>
               </motion.div>
             )}
           </div>
 
          {tasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="p-4">
                    <Skeleton className="h-24 w-full bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : availableTasks.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">No missions available</p>
                <p className="text-xs text-muted-foreground mt-1">Check back soon</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {availableTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <MissionCard
                      task={task}
                      isBlurred={expandedCard !== null && expandedCard !== `task-${task.id}`}
                      onExpandChange={(expanded) => handleCardExpand(`task-${task.id}`, expanded)}
                      onStart={() => handleStartTask(task)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Column 2: Traffic Intelligence Engine */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-amber-400" />
              <h2 className="font-bold text-foreground">Traffic Intelligence Engine</h2>
            </div>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              DEPLOY ₳
            </Badge>
          </div>

          <TierGate requiredTier="pro" featureName="Traffic Intelligence Engine">
            {/* Ad Package Grid - Platform Selection */}
            <div className="mb-4">
              <AdPackageGrid 
                onSelect={handleAdPlatformFilter} 
                activeFilter={adPlatformFilter}
                onCreateCampaign={() => setAdWizardOpen(true)}
              />
              {adPlatformFilter && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center justify-between"
                >
                  <Badge 
                    className="bg-amber-500/20 text-amber-400 border-amber-500/30"
                  >
                    {adPlatformFilter.charAt(0).toUpperCase() + adPlatformFilter.slice(1)} Campaigns
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setAdPlatformFilter(null)}
                  >
                    Clear Filter
                  </Button>
                </motion.div>
              )}
            </div>

            {isLoadingMyCampaigns ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Card key={i} className="bg-card border-border">
                    <CardContent className="p-4">
                      <Skeleton className="h-24 w-full bg-muted" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    {adPlatformFilter ? `No ${adPlatformFilter} campaigns` : 'No active campaigns'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {adPlatformFilter ? 'Try a different platform' : 'Create your first ad'}
                  </p>
                  <Button 
                    size="sm"
                    className="mt-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                    onClick={() => setAdWizardOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New Campaign
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredCampaigns.map((campaign, index) => (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CampaignCard
                        campaign={campaign}
                        isBlurred={expandedCard !== null && expandedCard !== `ad-${campaign.id}`}
                        onExpandChange={(expanded) => handleCardExpand(`ad-${campaign.id}`, expanded)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TierGate>
        </div>
      </div>

      {/* Modals */}
       <AlphaMissionModal 
         open={missionModalOpen} 
         onOpenChange={setMissionModalOpen} 
        task={selectedTask}
      />
      <AdWizardModal 
        isOpen={adWizardOpen} 
        onClose={() => setAdWizardOpen(false)} 
      />
    </div>
  );
}

// Pending Submission Card Component
interface PendingSubmissionCardProps {
  submission: TaskSubmission & { task?: Task };
}

function PendingSubmissionCard({ submission }: PendingSubmissionCardProps) {
  const submittedTime = formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true });
  
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/50">
      <div className="p-1.5 rounded-md bg-blue-500/20">
        <Clock className="h-3.5 w-3.5 text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">
          {submission.task?.title || 'Mission'}
        </p>
        <p className="text-[10px] text-muted-foreground">
          Submitted {submittedTime}
        </p>
      </div>
      <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
        <Timer className="h-2.5 w-2.5 mr-1" />
        Review
      </Badge>
    </div>
  );
}

// Mission Card Component
interface MissionCardProps {
  task: Task;
  isBlurred: boolean;
  onExpandChange: (expanded: boolean) => void;
  onStart: () => void;
}

function MissionCard({ task, isBlurred, onExpandChange, onStart }: MissionCardProps) {
  // Simulate submission window (24h from now for demo)
  const submissionDeadline = new Date();
  submissionDeadline.setHours(submissionDeadline.getHours() + 24);
  
  const hoursRemaining = differenceInHours(submissionDeadline, new Date());
  const progressPercent = Math.max(0, Math.min(100, (hoursRemaining / 24) * 100));

  const getProofIcon = (type: string) => {
    switch (type) {
      case 'screenshot': return Camera;
      case 'link': return LinkIcon;
      case 'verification': return FileCheck;
      default: return Upload;
    }
  };

  const ProofIcon = getProofIcon(task.proof_type);

  const expandedContent = (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-2 rounded-lg bg-muted/50">
          <p className="text-muted-foreground">Category</p>
          <p className="font-medium text-foreground">{task.category}</p>
        </div>
        <div className="p-2 rounded-lg bg-muted/50">
          <p className="text-muted-foreground">Proof Required</p>
          <p className="font-medium text-foreground capitalize">{task.proof_type}</p>
        </div>
        <div className="p-2 rounded-lg bg-muted/50">
          <p className="text-muted-foreground">Level</p>
          <p className="font-medium text-foreground capitalize">{task.required_level}</p>
        </div>
        <div className="p-2 rounded-lg bg-muted/50">
          <p className="text-muted-foreground">Time Left</p>
          <p className="font-medium text-[#FFD700]">{hoursRemaining}h</p>
        </div>
      </div>
      <Button 
        className="w-full bg-gradient-to-r from-[#FFD700] to-amber-500 text-black font-semibold hover:from-amber-400 hover:to-amber-600"
        onClick={(e) => {
          e.stopPropagation();
          onStart();
        }}
      >
        <Zap className="h-4 w-4 mr-2" />
        Start Mission
      </Button>
    </div>
  );

  return (
    <ExpandableCard
      isBlurred={isBlurred}
      onExpandChange={onExpandChange}
      expandedContent={expandedContent}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Radial Clock */}
          <div className="relative flex-shrink-0">
            <RadialProgressClock 
              progress={progressPercent} 
              size={48} 
              color="gold"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Clock className="h-4 w-4 text-[#FFD700]/70" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground line-clamp-1">{task.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{task.description}</p>
              </div>
              <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30 text-xs font-mono flex-shrink-0">
                +₳{task.reward}
              </Badge>
            </div>
            
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ProofIcon className="h-3 w-3" />
                {task.proof_type}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 text-[#FFD700]" />
                {task.category}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ExpandableCard>
  );
}

// Campaign Card Component
interface CampaignCardProps {
  campaign: AdCampaign;
  isBlurred: boolean;
  onExpandChange: (expanded: boolean) => void;
}

function CampaignCard({ campaign, isBlurred, onExpandChange }: CampaignCardProps) {
  // Calculate campaign duration progress
  const expiresAt = campaign.expires_at ? new Date(campaign.expires_at) : null;
  const daysRemaining = expiresAt ? Math.max(0, differenceInDays(expiresAt, new Date())) : 30;
  const totalDays = 30; // Default campaign duration
  const progressPercent = Math.max(0, (daysRemaining / totalDays) * 100);

  const completionRate = campaign.max_completions > 0 
    ? (campaign.current_completions / campaign.max_completions) * 100 
    : 0;

  const campaignType = CAMPAIGN_TYPES.find(t => t.value === campaign.campaign_type);

  const expandedContent = (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-2 rounded-lg bg-muted/50">
          <p className="text-muted-foreground">Completions</p>
          <p className="font-medium text-foreground">
            <OdometerNumber value={campaign.current_completions} /> / {campaign.max_completions}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-muted/50">
          <p className="text-muted-foreground">Reward/Task</p>
          <p className="font-medium text-amber-400">₳{campaign.reward_per_task}</p>
        </div>
        <div className="p-2 rounded-lg bg-muted/50">
          <p className="text-muted-foreground">Budget Used</p>
          <p className="font-medium text-foreground">
            ₳{(campaign.total_budget - campaign.remaining_budget).toFixed(0)}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-muted/50">
          <p className="text-muted-foreground">Remaining</p>
          <p className="font-medium text-emerald-400">₳{campaign.remaining_budget}</p>
        </div>
      </div>
      
      {/* Completion Progress */}
      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Completion Rate</span>
          <span className="text-xs font-mono text-amber-400">{completionRate.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <ExpandableCard
      isBlurred={isBlurred}
      onExpandChange={onExpandChange}
      expandedContent={expandedContent}
      headerAction={
        campaign.status === 'active' ? (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
            <Play className="h-2.5 w-2.5 mr-1" />
            Live
          </Badge>
        ) : (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
            <Clock className="h-2.5 w-2.5 mr-1" />
            Pending
          </Badge>
        )
      }
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Radial Clock - Campaign Duration */}
          <div className="relative flex-shrink-0">
            <RadialProgressClock 
              progress={progressPercent} 
              size={48} 
              color="amber"
            />
            <div className="absolute inset-0 flex items-center justify-center text-lg">
              {campaignType?.icon || '📢'}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground line-clamp-1">{campaign.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{campaignType?.label}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3 text-amber-400" />
                <OdometerNumber 
                  value={campaign.current_completions} 
                  className="text-amber-400 font-semibold"
                />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="h-3 w-3" />
                <span>{daysRemaining}d left</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ExpandableCard>
  );
}
