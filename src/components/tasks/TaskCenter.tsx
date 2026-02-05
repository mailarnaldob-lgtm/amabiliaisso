import { useState } from 'react';
import { ARMY_LEVELS, ArmyLevel } from '@/stores/appStore';
import { useTasks, useTaskSubmissions, useTaskStats, Task } from '@/hooks/useTasks';
import { useProfile } from '@/hooks/useProfile';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Info, Target, Clock, CheckCircle2, XCircle, Award, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const categories = ['All', 'Social Media', 'Video Engagement', 'Content Creation', 'Content Writing', 'Networking', 'Business Development'];

export function TaskCenter() {
  const { data: profile } = useProfile();
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: submissions, isLoading: submissionsLoading } = useTaskSubmissions();
  const stats = useTaskStats();
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Derive army level from completed tasks
  const completedCount = stats.totalCompleted;
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
  const rejectedSubmissions = submissions?.filter(s => s.status === 'rejected') || [];

  const isLoading = tasksLoading || submissionsLoading;

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <Alert className="border-[#FFD700]/30 bg-[#FFD700]/5">
        <Info className="h-4 w-4 text-[#FFD700]" />
        <AlertDescription className="text-xs">
          Complete VPA missions via the Command Center and submit proof for admin review. Credits are allocated after approval.
        </AlertDescription>
      </Alert>

      {/* VPA Level Card */}
      <Card className="bg-gradient-to-br from-[#FFD700]/10 to-[#FFD700]/5 border-[#FFD700]/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#FFD700]/20 border border-[#FFD700]/30 flex items-center justify-center text-2xl">
                {levelInfo.icon}
              </div>
              <div>
                <h3 className="font-bold text-foreground">{levelInfo.name}</h3>
                <p className="text-xs text-muted-foreground">VPA Level</p>
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
                <span className="text-muted-foreground">
                  Progress to {nextLevel[1].name}
                </span>
                <span className="text-[#FFD700] font-mono">
                  {completedCount}/{nextLevel[1].minTasks}
                </span>
              </div>
              <Progress value={progressToNext} className="h-2" />
            </div>
          )}
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/50">
            <div className="text-center">
              <p className="text-lg font-bold text-[#FFD700]">₳{stats.totalCreditsEarned}</p>
              <p className="text-[10px] text-muted-foreground">Total Earned</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-400">{stats.totalPending}</p>
              <p className="text-[10px] text-muted-foreground">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-400">{stats.todayCompleted}</p>
              <p className="text-[10px] text-muted-foreground">Today</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              selectedCategory === category
                ? 'bg-[#FFD700] text-black'
                : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* VPA Mission Tabs */}
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="available" className="flex-1">
            <Target className="h-3.5 w-3.5 mr-1.5" />
            Available ({filteredAvailable.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex-1">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Pending ({pendingSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Approved ({approvedSubmissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-3 mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full bg-muted" />
              ))}
            </div>
          ) : filteredAvailable.length > 0 ? (
            filteredAvailable.map((task) => (
              <TaskDisplayCard key={task.id} task={task} status="available" />
            ))
          ) : (
            <EmptyState 
              icon={<Target className="h-12 w-12" />}
              title="No available missions"
              description="Check back soon for new VPA missions"
            />
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-3 mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 w-full bg-muted" />
              ))}
            </div>
          ) : pendingSubmissions.length > 0 ? (
            pendingSubmissions.map((sub) => (
              <SubmissionDisplayCard key={sub.id} submission={sub} />
            ))
          ) : (
            <EmptyState 
              icon={<Clock className="h-12 w-12" />}
              title="No pending missions"
              description="Complete missions to see them here"
            />
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-24 w-full bg-muted" />
              ))}
            </div>
          ) : approvedSubmissions.length > 0 ? (
            approvedSubmissions.map((sub) => (
              <SubmissionDisplayCard key={sub.id} submission={sub} />
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
    </div>
  );
}

// Task Display Card
function TaskDisplayCard({ task, status }: { task: Task; status: string }) {
  return (
    <Card className="bg-card border-border hover:border-[#FFD700]/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/20">
            <Target className="h-5 w-5 text-[#FFD700]" />
          </div>
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
              <span className="capitalize">{task.category}</span>
              <span>•</span>
              <span className="capitalize">{task.proof_type} required</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Submission Display Card
function SubmissionDisplayCard({ submission }: { submission: any }) {
  const statusConfig = {
    pending: { icon: Clock, color: 'blue', label: 'Under Review' },
    approved: { icon: CheckCircle2, color: 'emerald', label: 'Approved' },
    rejected: { icon: XCircle, color: 'red', label: 'Rejected' }
  };
  
  const config = statusConfig[submission.status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;
  const timeAgo = formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true });
  
  return (
    <Card className={cn(
      "border",
      submission.status === 'approved' && "border-emerald-500/30 bg-emerald-500/5",
      submission.status === 'pending' && "border-blue-500/30 bg-blue-500/5",
      submission.status === 'rejected' && "border-red-500/30 bg-red-500/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2.5 rounded-lg border",
            submission.status === 'approved' && "bg-emerald-500/10 border-emerald-500/20",
            submission.status === 'pending' && "bg-blue-500/10 border-blue-500/20",
            submission.status === 'rejected' && "bg-red-500/10 border-red-500/20"
          )}>
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
                <p className="font-semibold text-foreground line-clamp-1">
                  {submission.task?.title || 'Mission'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
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
    <Card className="bg-card border-border">
      <CardContent className="p-8 text-center">
        <div className="mx-auto text-muted-foreground/50 mb-3">
          {icon}
        </div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
