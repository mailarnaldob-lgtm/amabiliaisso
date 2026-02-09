import { useState, useMemo } from 'react';
import { AlphaLayout } from '@/components/layouts/AlphaLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Target, 
  Clock, 
  CheckCircle2, 
  Star,
  Trophy,
  Zap,
  Upload,
  Camera,
  Link as LinkIcon,
  FileCheck,
  Timer,
  XCircle,
  Loader2
} from 'lucide-react';
import { formatAlpha } from '@/lib/utils';
import { useTasks, useTaskSubmissions, useTaskStats, Task } from '@/hooks/useTasks';
import { TaskSubmissionModal } from '@/components/alpha/TaskSubmissionModal';
import { formatDistanceToNow } from 'date-fns';

type MissionCategory = string;

export default function MarketApp() {
  const [activeCategory, setActiveCategory] = useState<MissionCategory>('all');
  const [activeTab, setActiveTab] = useState('available');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch real data
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: submissions, isLoading: submissionsLoading } = useTaskSubmissions();
  const stats = useTaskStats();

  // Get task IDs that user has already submitted
  const submittedTaskIds = useMemo(() => {
    return new Set(submissions?.map((s) => s.task_id) || []);
  }, [submissions]);

  // Filter available tasks (not yet submitted by user)
  const availableTasks = useMemo(() => {
    if (!tasks) return [];
    const filtered = tasks.filter((t) => !submittedTaskIds.has(t.id));
    if (activeCategory === 'all') return filtered;
    return filtered.filter((t) => t.category === activeCategory);
  }, [tasks, submittedTaskIds, activeCategory]);

  // Separate submissions by status
  const pendingSubmissions = useMemo(() => 
    submissions?.filter((s) => s.status === 'pending') || [], 
    [submissions]
  );
  
  const completedSubmissions = useMemo(() => 
    submissions?.filter((s) => s.status === 'approved') || [], 
    [submissions]
  );

  const rejectedSubmissions = useMemo(() => 
    submissions?.filter((s) => s.status === 'rejected') || [], 
    [submissions]
  );

  const handleStartTask = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  // Get unique categories from tasks
  const categories = useMemo(() => {
    if (!tasks) return ['all'];
    const cats = new Set(tasks.map((t) => t.category));
    return ['all', ...Array.from(cats)] as MissionCategory[];
  }, [tasks]);

  const isLoading = tasksLoading || submissionsLoading;

  return (
    <AlphaLayout 
      title="Global Assignments" 
      subtitle="VPA Missions"
    >
      {/* Daily Progress - Golden-Yellow Theme */}
      <Card className="mb-6 overflow-hidden bg-card border-[#FFD700]/20 backdrop-blur-xl">
        <div className="bg-gradient-to-br from-[#FFD700]/20 to-[#FFA500]/5 p-5 border-b border-[#FFD700]/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Your Progress</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stats.totalCompleted} <span className="text-[#FFD700]">Missions</span></p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-amber-400">
                <Clock className="h-4 w-4" />
                <span className="font-mono font-bold">{stats.totalPending} Pending</span>
              </div>
            </div>
          </div>
          <Progress 
            value={stats.totalCompleted > 0 ? 100 : 0} 
            className="h-1.5 bg-muted" 
          />
        </div>
        <CardContent className="p-4 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#FFD700]" />
              <span className="text-sm text-muted-foreground">Total Credits:</span>
            </div>
            <span className="font-bold text-[#FFD700] font-mono text-lg">₳{formatAlpha(stats.totalCreditsEarned)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Mission Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="grid w-full grid-cols-3 bg-card border border-border p-1">
          <TabsTrigger 
            value="available" 
            className="gap-1 text-xs data-[state=active]:bg-[#FFD700]/20 data-[state=active]:text-[#FFD700]"
          >
            <Target className="h-3 w-3" />
            Available
            {availableTasks.length > 0 && (
              <Badge className="ml-1 h-4 min-w-4 p-0 text-[10px] bg-[#FFD700] text-black">
                {availableTasks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            className="gap-1 text-xs data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
          >
            <Clock className="h-3 w-3" />
            Pending
            {pendingSubmissions.length > 0 && (
              <Badge className="ml-1 h-4 min-w-4 p-0 text-[10px] bg-amber-500 text-black">
                {pendingSubmissions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="gap-1 text-xs data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
          >
            <CheckCircle2 className="h-3 w-3" />
            Done
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          {/* Mission Categories - Pill Style */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 scrollbar-hide">
            {categories.map((cat) => (
              <CategoryPill 
                key={cat}
                label={cat === 'all' ? 'All' : cat} 
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </div>

          {/* Available Missions */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-card border-border">
                  <CardContent className="p-4">
                    <Skeleton className="h-20 w-full bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : availableTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No Missions Available</p>
              <p className="text-xs mt-1">Check back later for new missions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableTasks.map((task) => (
                <MissionCard 
                  key={task.id} 
                  task={task} 
                  onStart={() => handleStartTask(task)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
              <p className="text-xs text-amber-400 flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Proofs reviewed within 48 hours
              </p>
            </div>
            
            {pendingSubmissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No Pending Submissions</p>
              </div>
            ) : (
              pendingSubmissions.map((submission) => (
                <Card key={submission.id} className="bg-card border-amber-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <FileCheck className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{submission.task?.title || 'Task'}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-mono text-[#FFD700]">₳{submission.task?.reward || 0}</p>
                        <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-[10px]">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Pending
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* Show rejected submissions */}
            {rejectedSubmissions.length > 0 && (
              <>
                <h4 className="text-sm text-muted-foreground mt-6 mb-2">Rejected</h4>
                {rejectedSubmissions.map((submission) => (
                  <Card key={submission.id} className="bg-card border-destructive/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                            <XCircle className="h-5 w-5 text-destructive" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{submission.task?.title || 'Task'}</p>
                            <p className="text-xs text-destructive">
                              {submission.rejection_reason || 'Submission rejected'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="space-y-3">
            {completedSubmissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No Completed Missions</p>
                <p className="text-xs mt-1">Complete missions to earn credits</p>
              </div>
            ) : (
              completedSubmissions.map((submission) => (
                <Card key={submission.id} className="bg-card border-emerald-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{submission.task?.title || 'Task'}</p>
                          <p className="text-xs text-muted-foreground">
                            {submission.reviewed_at 
                              ? formatDistanceToNow(new Date(submission.reviewed_at), { addSuffix: true })
                              : 'Recently'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-400 font-mono">
                          +₳{submission.reward_amount || submission.task?.reward || 0}
                        </p>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
                          Approved
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* VPA Mission Flow */}
      <Card className="mt-6 bg-card border-border">
        <CardContent className="p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2 text-foreground">
            <Zap className="h-4 w-4 text-[#FFD700]" />
            Mission Flow
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li className="flex items-center gap-2">
              <span className="text-[#FFD700]">01.</span> Select an available mission
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#FFD700]">02.</span> Complete the task requirements
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#FFD700]">03.</span> Submit proof (screenshot or link)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#FFD700]">04.</span> Admin reviews within 48 hours
            </li>
            <li className="flex items-center gap-2">
              <span className="text-[#FFD700]">05.</span> Credits added to Task Wallet
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          Global Assignments power the Amabilia Network economy. 
          ₳ Credits earned represent your Proof-of-Participation. All submissions are logged on the Sovereign Ledger.
        </p>
      </div>

      {/* Submission Modal */}
      <TaskSubmissionModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
        task={selectedTask}
      />
    </AlphaLayout>
  );
}

function CategoryPill({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 active:scale-95 ${
        active 
          ? 'bg-[#FFD700] text-black shadow-lg shadow-[#FFD700]/30' 
          : 'bg-card text-muted-foreground border border-border hover:border-[#FFD700]/30 hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}

function MissionCard({ task, onStart }: { task: Task; onStart: () => void }) {
  const getDifficultyFromLevel = (level: string) => {
    switch (level) {
      case 'cadet': return 'Easy';
      case 'specialist': return 'Medium';
      case 'veteran': return 'Hard';
      case 'commander': return 'Special';
      default: return 'Easy';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Hard': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Special': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getProofIcon = (type: string) => {
    switch (type) {
      case 'screenshot': return Camera;
      case 'link': return LinkIcon;
      case 'verification': return FileCheck;
      default: return Upload;
    }
  };

  const difficulty = getDifficultyFromLevel(task.required_level);
  const ProofIcon = getProofIcon(task.proof_type);

  return (
    <Card className="overflow-hidden bg-card border-border hover:border-[#FFD700]/30 transition-all duration-150 hover:-translate-y-0.5">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/20 mt-0.5">
              <Target className="h-5 w-5 text-[#FFD700]" />
            </div>
            <div>
              <p className="font-medium text-foreground">{task.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
            </div>
          </div>
          <Badge className={`${getDifficultyColor(difficulty)} border text-[10px]`} variant="outline">
            {difficulty}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ProofIcon className="h-3 w-3" />
              {task.proof_type}
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-[#FFD700]" />
              {task.category}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-[#FFD700] font-mono">₳{task.reward}</span>
            <Button 
              size="sm" 
              onClick={onStart}
              className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] hover:opacity-90 text-black font-bold text-xs active:scale-95 transition-all duration-150"
            >
              Start
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}