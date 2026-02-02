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
      title="₳LPHA MARKET" 
      subtitle="VPA Missions"
      appColor="from-accent to-accent/70"
    >
      {/* Daily Progress - Terminal Style */}
      <Card className="mb-6 overflow-hidden bg-slate/80 border-accent/20 backdrop-blur-xl">
        <div className="bg-gradient-to-br from-accent/20 to-accent/5 p-5 border-b border-accent/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-platinum/60 font-mono uppercase tracking-widest">YOUR_PROGRESS</p>
              <p className="text-2xl font-bold text-platinum font-display mt-1">{stats.totalCompleted} <span className="text-accent">Missions</span></p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-amber-400">
                <Clock className="h-4 w-4" />
                <span className="font-mono font-bold">{stats.totalPending} PENDING</span>
              </div>
            </div>
          </div>
          <Progress 
            value={stats.totalCompleted > 0 ? 100 : 0} 
            className="h-1.5 bg-obsidian/50" 
          />
        </div>
        <CardContent className="p-4 bg-obsidian/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-accent" />
              <span className="text-sm text-platinum/60 font-mono">TOTAL_CREDITS:</span>
            </div>
            <span className="font-bold text-accent font-mono text-lg">₳{formatAlpha(stats.totalCreditsEarned)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Mission Status Tabs - Obsidian Style */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="grid w-full grid-cols-3 bg-slate/80 border border-platinum/10 p-1">
          <TabsTrigger 
            value="available" 
            className="gap-1 text-xs font-mono data-[state=active]:bg-accent/20 data-[state=active]:text-accent"
          >
            <Target className="h-3 w-3" />
            Available
            {availableTasks.length > 0 && (
              <Badge className="ml-1 h-4 min-w-4 p-0 text-[10px] bg-accent text-obsidian">
                {availableTasks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="pending" 
            className="gap-1 text-xs font-mono data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
          >
            <Clock className="h-3 w-3" />
            Pending
            {pendingSubmissions.length > 0 && (
              <Badge className="ml-1 h-4 min-w-4 p-0 text-[10px] bg-amber-500 text-obsidian">
                {pendingSubmissions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="gap-1 text-xs font-mono data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
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
                label={cat === 'all' ? 'ALL' : cat.toUpperCase()} 
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </div>

          {/* Available Missions */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-slate/60 border-platinum/10">
                  <CardContent className="p-4">
                    <Skeleton className="h-20 w-full bg-platinum/5" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : availableTasks.length === 0 ? (
            <div className="text-center py-12 text-platinum/40">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-mono">NO_MISSIONS_AVAILABLE</p>
              <p className="text-xs mt-1 font-mono">Check back later for new missions</p>
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
              <p className="text-xs text-amber-400 flex items-center gap-2 font-mono">
                <Timer className="h-4 w-4" />
                PROOFS_REVIEWED_WITHIN_48H
              </p>
            </div>
            
            {pendingSubmissions.length === 0 ? (
              <div className="text-center py-12 text-platinum/40">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-mono">NO_PENDING_SUBMISSIONS</p>
              </div>
            ) : (
              pendingSubmissions.map((submission) => (
                <Card key={submission.id} className="bg-slate/60 border-amber-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <FileCheck className="h-5 w-5 text-amber-400" />
                        </div>
                        <div>
                          <p className="font-medium text-platinum">{submission.task?.title || 'Task'}</p>
                          <p className="text-xs text-platinum/50 font-mono">
                            {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold font-mono text-accent">₳{submission.task?.reward || 0}</p>
                        <Badge variant="outline" className="text-amber-400 border-amber-500/30 font-mono text-[10px]">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          PENDING
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
                <h4 className="text-sm font-mono text-platinum/50 mt-6 mb-2">REJECTED</h4>
                {rejectedSubmissions.map((submission) => (
                  <Card key={submission.id} className="bg-slate/60 border-destructive/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                            <XCircle className="h-5 w-5 text-destructive" />
                          </div>
                          <div>
                            <p className="font-medium text-platinum">{submission.task?.title || 'Task'}</p>
                            <p className="text-xs text-destructive font-mono">
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
              <div className="text-center py-12 text-platinum/40">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-mono">NO_COMPLETED_MISSIONS</p>
                <p className="text-xs mt-1 font-mono">Complete missions to earn credits</p>
              </div>
            ) : (
              completedSubmissions.map((submission) => (
                <Card key={submission.id} className="bg-slate/60 border-emerald-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-platinum">{submission.task?.title || 'Task'}</p>
                          <p className="text-xs text-platinum/50 font-mono">
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
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                          APPROVED
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

      {/* VPA Mission Flow - Terminal Card */}
      <Card className="mt-6 bg-slate/60 border-platinum/10">
        <CardContent className="p-4">
          <h4 className="font-medium mb-3 flex items-center gap-2 text-platinum font-mono">
            <Zap className="h-4 w-4 text-accent" />
            VPA_MISSION_FLOW
          </h4>
          <ul className="text-xs text-platinum/60 space-y-1.5 font-mono">
            <li className="flex items-center gap-2">
              <span className="text-accent">01.</span> Select an available mission
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">02.</span> Complete the task requirements
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">03.</span> Submit proof (screenshot or link)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">04.</span> Admin reviews within 48 hours
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">05.</span> Credits added to Task Wallet
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="mt-8 p-4 rounded-lg bg-obsidian/80 border border-platinum/10">
        <p className="text-xs text-platinum/40 text-center font-mono">
          VPA missions are voluntary participation activities. 
          Credits are for platform use only. All proofs are logged immutably.
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
      className={`px-4 py-1.5 rounded text-xs font-mono font-medium whitespace-nowrap transition-all duration-150 active:scale-95 ${
        active 
          ? 'bg-accent text-obsidian shadow-glow-cyan' 
          : 'bg-slate/60 text-platinum/60 border border-platinum/10 hover:border-accent/30 hover:text-platinum'
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
      default: return 'bg-slate text-platinum/60';
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
    <Card className="overflow-hidden bg-slate/60 border-platinum/10 hover:border-accent/30 transition-all duration-150 hover:-translate-y-0.5">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 mt-0.5">
              <Target className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-platinum">{task.title}</p>
              <p className="text-xs text-platinum/50 mt-0.5">{task.description}</p>
            </div>
          </div>
          <Badge className={`${getDifficultyColor(difficulty)} border font-mono text-[10px]`} variant="outline">
            {difficulty.toUpperCase()}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-platinum/50 font-mono">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-accent" />
              ₳{task.reward}
            </span>
            <span className="flex items-center gap-1">
              <ProofIcon className="h-3 w-3" />
              {task.proof_type}
            </span>
            <Badge variant="outline" className="text-[10px] border-platinum/20 text-platinum/50">
              {task.category.toUpperCase()}
            </Badge>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={onStart}
            className="font-mono text-xs border-accent/30 text-accent hover:bg-accent/10 hover:border-accent active:scale-95 transition-all duration-150"
          >
            START
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
