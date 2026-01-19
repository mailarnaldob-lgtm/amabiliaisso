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
      appColor="from-emerald-500 to-teal-600"
    >
      {/* Daily Progress */}
      <Card className="mb-6 overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm opacity-80">Your Progress</p>
              <p className="text-2xl font-bold">{stats.totalCompleted} Missions Completed</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="font-bold">{stats.totalPending} Pending</span>
              </div>
            </div>
          </div>
          <Progress 
            value={stats.totalCompleted > 0 ? 100 : 0} 
            className="h-2 bg-white/20" 
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span className="text-sm text-muted-foreground">Total Credits Earned:</span>
            </div>
            <span className="font-bold text-foreground">₳{formatAlpha(stats.totalCreditsEarned)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Mission Status Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available" className="gap-1 text-xs">
            <Target className="h-3 w-3" />
            Available
            {availableTasks.length > 0 && (
              <Badge className="ml-1 h-4 w-4 p-0 text-[10px] bg-emerald-500">
                {availableTasks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-1 text-xs">
            <Clock className="h-3 w-3" />
            Pending
            {pendingSubmissions.length > 0 && (
              <Badge className="ml-1 h-4 w-4 p-0 text-[10px] bg-amber-500">
                {pendingSubmissions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-1 text-xs">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          {/* Mission Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4">
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
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : availableTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No available missions</p>
              <p className="text-xs mt-1">Check back later for new missions!</p>
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
              <p className="text-xs text-amber-600 flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Proofs are reviewed within 48 hours by admin.
              </p>
            </div>
            
            {pendingSubmissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No pending submissions</p>
              </div>
            ) : (
              pendingSubmissions.map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/10">
                          <FileCheck className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="font-medium">{submission.task?.title || 'Task'}</p>
                          <p className="text-xs text-muted-foreground">
                            Submitted {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₳{submission.task?.reward || 0}</p>
                        <Badge variant="outline" className="text-amber-600 border-amber-500/30">
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
                <h4 className="text-sm font-medium text-muted-foreground mt-4">Rejected</h4>
                {rejectedSubmissions.map((submission) => (
                  <Card key={submission.id} className="border-destructive/30">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-destructive/10">
                            <XCircle className="h-5 w-5 text-destructive" />
                          </div>
                          <div>
                            <p className="font-medium">{submission.task?.title || 'Task'}</p>
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
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No completed missions yet</p>
                <p className="text-xs mt-1">Complete missions to earn credits!</p>
              </div>
            ) : (
              completedSubmissions.map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/10">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-medium">{submission.task?.title || 'Task'}</p>
                          <p className="text-xs text-muted-foreground">
                            Approved {submission.reviewed_at 
                              ? formatDistanceToNow(new Date(submission.reviewed_at), { addSuffix: true })
                              : 'recently'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-500">
                          +₳{submission.reward_amount || submission.task?.reward || 0}
                        </p>
                        <Badge className="bg-emerald-500 text-[10px]">Approved</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Escrow Info */}
      <Card className="mt-4 bg-muted/30">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            VPA Mission Flow
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>1. Select an available mission</li>
            <li>2. Complete the task requirements</li>
            <li>3. Submit proof (screenshot or link)</li>
            <li>4. Admin reviews within 48 hours</li>
            <li>5. Credits added to Task Wallet on approval</li>
          </ul>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          VPA missions are voluntary participation activities. 
          Credits are for platform use only and cannot be converted to money.
          All proofs are logged immutably for audit.
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
      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
        active 
          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' 
          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
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
      case 'Easy': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'Medium': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'Hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'Special': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
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
    <Card className="overflow-hidden hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 mt-0.5">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-foreground">{task.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
            </div>
          </div>
          <Badge className={getDifficultyColor(difficulty)} variant="outline">
            {difficulty}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-500" />
              ₳{task.reward}
            </span>
            <span className="flex items-center gap-1">
              <ProofIcon className="h-3 w-3" />
              {task.proof_type}
            </span>
            <Badge variant="outline" className="text-[10px]">
              {task.category}
            </Badge>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={onStart}
          >
            Start
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
