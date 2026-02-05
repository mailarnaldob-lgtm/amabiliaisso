/**
 * EARN HUB OVERLAY - V10.0
 * Isolated full-screen overlay for Task/Mission rewards
 * 
 * Architecture:
 * - RESTful polling (15-second intervals)
 * - No WebSockets or realtime subscriptions
 * - Standard Supabase storage for proof uploads
 * - AnimatedOdometers for reward figures
 * 
 * Theme: Obsidian Black (#050505) + Alpha Gold (#FFD700)
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, CheckCircle2, Clock, Award, Zap, Upload, ExternalLink, Info, FileCheck, AlertCircle, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EliteButton } from '@/components/ui/elite-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTasks, useTaskSubmissions, useTaskStats, Task } from '@/hooks/useTasks';
import { useProfile } from '@/hooks/useProfile';
import { ARMY_LEVELS, ArmyLevel } from '@/stores/appStore';
import { formatDistanceToNow } from 'date-fns';
import { OdometerNumber } from '@/components/command/OdometerNumber';
import { TaskSubmissionModal } from '@/components/alpha/TaskSubmissionModal';

interface EarnHubOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = ['All', 'Social Media', 'Video Engagement', 'Content Creation', 'Content Writing', 'Networking', 'Business Development'];

// Business Logic Explanation Component
function BusinessLogicSection() {
  return (
    <Card className="bg-[#050505]/80 border-[#FFD700]/20 backdrop-blur-xl">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-[#FFD700]" />
          <h3 className="font-bold text-[#FFD700]">Task/Rewards Business Logic</h3>
        </div>
        
        <div className="space-y-3 text-sm text-zinc-300">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-[#FFD700]/10">
              <Target className="h-4 w-4 text-[#FFD700]" />
            </div>
            <div>
              <p className="font-semibold text-white">1. Start Mission</p>
              <p className="text-zinc-400">Click the target URL to complete the task externally (YouTube watch, social follow, etc.)</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-emerald-500/10">
              <Upload className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-white">2. Submit Proof</p>
              <p className="text-zinc-400">Upload a screenshot or provide a link as evidence of task completion</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-blue-500/10">
              <Clock className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-white">3. Admin Review</p>
              <p className="text-zinc-400">Admins verify proofs within 1-24 hours. Only admins can view uploaded proofs.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-[#FFD700]/10">
              <Zap className="h-4 w-4 text-[#FFD700]" />
            </div>
            <div>
              <p className="font-semibold text-white">4. Instant Credit</p>
              <p className="text-zinc-400">Upon approval, ₳ Credits are instantly deposited to your Task Wallet</p>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t border-[#FFD700]/10">
          <p className="text-xs text-zinc-500">
            <span className="text-[#FFD700]">90/10 Split:</span> You receive 90% of the reward. 10% supports platform operations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Animated Stats Header
function StatsHeader({ stats }: { stats: ReturnType<typeof useTaskStats> }) {
  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-[#050505]/60 rounded-xl border border-[#FFD700]/20 backdrop-blur-xl">
      <div className="text-center">
        <div className="text-2xl font-bold text-[#FFD700]">
          <OdometerNumber value={stats.totalCreditsEarned} prefix="₳" />
        </div>
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Total Earned</p>
      </div>
      <div className="text-center border-x border-[#FFD700]/10">
        <div className="text-2xl font-bold text-blue-400">
          <OdometerNumber value={stats.totalPending} />
        </div>
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Pending</p>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-emerald-400">
          <OdometerNumber value={stats.todayCompleted} />
        </div>
        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Today</p>
      </div>
    </div>
  );
}

// VPA Level Card
function VPALevelCard({ completedCount }: { completedCount: number }) {
  const armyLevel: ArmyLevel = completedCount >= 500 ? 'elite_operator' 
    : completedCount >= 150 ? 'vanguard'
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

// Mission Card Component
function MissionCard({ 
  task, 
  onStartMission 
}: { 
  task: Task; 
  onStartMission: (task: Task) => void;
}) {
  return (
    <Card className="bg-[#050505]/80 border-[#FFD700]/10 hover:border-[#FFD700]/40 transition-all duration-300 backdrop-blur-xl group">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#FFD700]/20 to-[#FFD700]/5 border border-[#FFD700]/20 group-hover:border-[#FFD700]/40 transition-colors">
            <Target className="h-6 w-6 text-[#FFD700]" />
          </div>
          
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-white line-clamp-1">{task.title}</h4>
                <p className="text-xs text-zinc-500 line-clamp-2 mt-0.5">{task.description}</p>
              </div>
              <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30 font-mono flex-shrink-0">
                <OdometerNumber value={task.reward} prefix="+₳" className="text-xs" />
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="px-2 py-0.5 rounded bg-[#FFD700]/5 border border-[#FFD700]/10 capitalize">
                  {task.category}
                </span>
                <span className="capitalize">{task.proof_type} required</span>
              </div>
              
              <EliteButton
                size="sm"
                className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black font-semibold hover:opacity-90 h-8"
                onClick={() => onStartMission(task)}
              >
                <Target className="h-3.5 w-3.5 mr-1" />
                Start
              </EliteButton>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Submission Card Component
function SubmissionCard({ submission }: { submission: any }) {
  const statusConfig = {
    pending: { icon: Clock, color: 'blue', label: 'Under Review', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    approved: { icon: CheckCircle2, color: 'emerald', label: 'Approved', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    rejected: { icon: AlertCircle, color: 'red', label: 'Rejected', bg: 'bg-red-500/10', border: 'border-red-500/30' }
  };
  
  const config = statusConfig[submission.status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;
  const timeAgo = formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true });
  
  return (
    <Card className={cn(
      "bg-[#050505]/80 backdrop-blur-xl transition-all",
      config.border
    )}>
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
                <p className="text-xs text-zinc-500 mt-0.5">
                  Submitted {timeAgo}
                </p>
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
              <p className="mt-2 text-xs text-red-400">
                Reason: {submission.rejection_reason}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Empty State Component
function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-[#050505]/60 border-[#FFD700]/10">
      <CardContent className="p-8 text-center">
        <div className="mx-auto text-zinc-600 mb-3">
          {icon}
        </div>
        <p className="font-medium text-white">{title}</p>
        <p className="text-xs text-zinc-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}

export function EarnHubOverlay({ isOpen, onClose }: EarnHubOverlayProps) {
  const { data: profile } = useProfile();
  const { data: tasks, isLoading: tasksLoading, refetch: refetchTasks } = useTasks();
  const { data: submissions, isLoading: submissionsLoading, refetch: refetchSubmissions } = useTaskSubmissions();
  const stats = useTaskStats();
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);

  // 15-second RESTful polling for live data
  useEffect(() => {
    if (!isOpen) return;
    
    const pollInterval = setInterval(() => {
      refetchTasks();
      refetchSubmissions();
    }, 15000);
    
    return () => clearInterval(pollInterval);
  }, [isOpen, refetchTasks, refetchSubmissions]);

  // Get submitted task IDs for filtering
  const submittedTaskIds = new Set(submissions?.map(s => s.task_id) || []);
  
  // Filter available tasks (not yet submitted)
  const availableTasks = tasks?.filter(t => !submittedTaskIds.has(t.id)) || [];
  const filteredAvailable = selectedCategory === 'All' 
    ? availableTasks 
    : availableTasks.filter(t => t.category === selectedCategory);

  // Filter submissions by status
  const pendingSubmissions = submissions?.filter(s => s.status === 'pending') || [];
  const approvedSubmissions = submissions?.filter(s => s.status === 'approved') || [];

  const isLoading = tasksLoading || submissionsLoading;

  const handleStartMission = useCallback((task: Task) => {
    setSelectedTask(task);
    setSubmissionModalOpen(true);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            className="fixed inset-0 z-50 bg-[#050505]/95 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          
          {/* Overlay Content */}
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
                    <p className="text-xs text-zinc-500">VPA Mission Control</p>
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
              
              {/* Info Banner */}
              <Alert className="border-[#FFD700]/30 bg-[#FFD700]/5 mb-4">
                <FileCheck className="h-4 w-4 text-[#FFD700]" />
                <AlertDescription className="text-xs text-zinc-300">
                  Complete VPA missions and submit proof for admin review. Credits are allocated after approval.
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
              
              {/* Category Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mt-6">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                      selectedCategory === category
                        ? 'bg-[#FFD700] text-black'
                        : 'bg-[#FFD700]/10 text-zinc-400 hover:text-white hover:bg-[#FFD700]/20'
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              {/* Mission Tabs */}
              <Tabs defaultValue="available" className="w-full mt-4">
                <TabsList className="w-full bg-[#050505]/80 border border-[#FFD700]/20">
                  <TabsTrigger value="available" className="flex-1 data-[state=active]:bg-[#FFD700] data-[state=active]:text-black">
                    <Target className="h-3.5 w-3.5 mr-1.5" />
                    Available ({filteredAvailable.length})
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="flex-1 data-[state=active]:bg-[#FFD700] data-[state=active]:text-black">
                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                    Pending ({pendingSubmissions.length})
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="flex-1 data-[state=active]:bg-[#FFD700] data-[state=active]:text-black">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    Approved ({approvedSubmissions.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="available" className="space-y-3 mt-4">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full bg-[#FFD700]/5" />
                      ))}
                    </div>
                  ) : filteredAvailable.length > 0 ? (
                    filteredAvailable.map((task) => (
                      <MissionCard 
                        key={task.id} 
                        task={task} 
                        onStartMission={handleStartMission}
                      />
                    ))
                  ) : (
                    <EmptyState 
                      icon={<Target className="h-12 w-12" />}
                      title="No available missions"
                      description="Check back soon for new VPA missions"
                    />
                  )}
                </TabsContent>

                <TabsContent value="pending" className="space-y-3 mt-4">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-24 w-full bg-blue-500/5" />
                      ))}
                    </div>
                  ) : pendingSubmissions.length > 0 ? (
                    pendingSubmissions.map((sub) => (
                      <SubmissionCard key={sub.id} submission={sub} />
                    ))
                  ) : (
                    <EmptyState 
                      icon={<Clock className="h-12 w-12" />}
                      title="No pending missions"
                      description="Complete missions to see them here"
                    />
                  )}
                </TabsContent>

                <TabsContent value="approved" className="space-y-3 mt-4">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-24 w-full bg-emerald-500/5" />
                      ))}
                    </div>
                  ) : approvedSubmissions.length > 0 ? (
                    approvedSubmissions.map((sub) => (
                      <SubmissionCard key={sub.id} submission={sub} />
                    ))
                  ) : (
                    <EmptyState 
                      icon={<CheckCircle2 className="h-12 w-12" />}
                      title="No approved missions yet"
                      description="Your approved missions will appear here"
                    />
                  )}
                </TabsContent>
              </Tabs>
              
              {/* Footer Disclaimer */}
              <div className="mt-8 p-4 rounded-xl bg-[#050505]/60 border border-[#FFD700]/10">
                <p className="text-xs text-zinc-500 text-center">
                  All proof submissions are reviewed by admins. Proof files are stored securely and visible only to you and admins.
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Task Submission Modal */}
          <TaskSubmissionModal
            open={submissionModalOpen}
            onOpenChange={(open) => {
              setSubmissionModalOpen(open);
              if (!open) setSelectedTask(null);
            }}
            task={selectedTask}
          />
        </>
      )}
    </AnimatePresence>
  );
}
