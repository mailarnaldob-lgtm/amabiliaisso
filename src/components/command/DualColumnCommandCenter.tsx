import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RadialProgressClock } from './RadialProgressClock';
import { OdometerNumber } from './OdometerNumber';
import { ExpandableCard } from './ExpandableCard';
 import { SocialIconGrid } from './SocialIconGrid';
 import { AlphaMissionModal } from './AlphaMissionModal';
import { useTasks, useTaskSubmissions, Task } from '@/hooks/useTasks';
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
   Sparkles
} from 'lucide-react';

const POLL_INTERVAL = 15000; // 15 seconds

export function DualColumnCommandCenter() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
   const [missionModalOpen, setMissionModalOpen] = useState(false);
  const [adWizardOpen, setAdWizardOpen] = useState(false);
   const [filterPlatform, setFilterPlatform] = useState<string | null>(null);

  // Data hooks
  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = useTasks();
  const { data: submissions, refetch: refetchSubmissions } = useTaskSubmissions();
  const { myCampaigns, isLoadingMyCampaigns, refetchMyCampaigns } = useAdCampaigns();
  const { data: profile } = useProfile();

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
    return tasks.filter((t) => !submittedTaskIds.has(t.id)).slice(0, 6);
  }, [tasks, submittedTaskIds]);

  // Active campaigns for display
  const activeCampaigns = useMemo(() => {
    return myCampaigns?.filter(c => 
      c.status === 'active' || c.status === 'pending'
    ).slice(0, 4) || [];
  }, [myCampaigns]);

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
 
  // Calculate stats
  const totalMissions = availableTasks.length;
  const totalRewards = availableTasks.reduce((sum, t) => sum + t.reward, 0);
  const totalCampaigns = activeCampaigns.length;
  const totalReach = activeCampaigns.reduce((sum, c) => sum + c.current_completions, 0);

  return (
    <div className="space-y-6">
      {/* Dual Stats Header */}
      <div className="grid grid-cols-2 gap-4">
        {/* Missions Stats */}
        <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FFD700]/5 border-[#FFD700]/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-[#FFD700]/20 border border-[#FFD700]/30">
                <Target className="h-5 w-5 text-[#FFD700]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Missions</p>
                <OdometerNumber 
                  value={totalMissions} 
                  className="text-2xl font-bold text-[#FFD700]"
                />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Zap className="h-3 w-3 text-[#FFD700]" />
              <span>₳<OdometerNumber value={totalRewards} className="text-[#FFD700] font-semibold" /> available</span>
            </div>
          </CardContent>
        </Card>

        {/* Ads Stats */}
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/30">
                <Megaphone className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Campaigns</p>
                <OdometerNumber 
                  value={totalCampaigns} 
                  className="text-2xl font-bold text-amber-400"
                />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3 text-amber-400" />
              <span><OdometerNumber value={totalReach} className="text-amber-400 font-semibold" /> reach</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dual Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Operative Mission Hub */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-[#FFD700]" />
              <h2 className="font-bold text-foreground">Operative Mission Hub</h2>
            </div>
            <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30">
              EARN ₳
            </Badge>
          </div>

           {/* Social Icon Grid Filter */}
           <div className="mb-4">
             <SocialIconGrid onSelect={handlePlatformFilter} />
             {filterPlatform && (
               <motion.div 
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="mt-2 flex items-center gap-2"
               >
                 <Badge 
                   variant="outline" 
                   className="bg-muted/50 cursor-pointer hover:bg-muted"
                   onClick={() => setFilterPlatform(null)}
                 >
                   Showing: {filterPlatform.toUpperCase()} × Clear
                 </Badge>
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

        {/* Column 2: Sovereign Ad Engine */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-amber-400" />
              <h2 className="font-bold text-foreground">Sovereign Ad Engine</h2>
            </div>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
              DEPLOY ₳
            </Badge>
          </div>

          <TierGate requiredTier="pro" featureName="Sovereign Ad Engine">
            {/* Create Campaign CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <Card 
                className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/40 cursor-pointer hover:border-amber-400/60 transition-all"
                onClick={() => setAdWizardOpen(true)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/30">
                        <Plus className="h-5 w-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Create Campaign</p>
                        <p className="text-xs text-muted-foreground">Reach the VPA network</p>
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      New Ad
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

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
            ) : activeCampaigns.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No active campaigns</p>
                  <p className="text-xs text-muted-foreground mt-1">Create your first ad</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {activeCampaigns.map((campaign, index) => (
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
