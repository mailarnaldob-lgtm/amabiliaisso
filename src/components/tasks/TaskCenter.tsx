import { useState } from 'react';
import { useAppStore, MOCK_TASKS, ARMY_LEVELS, ArmyLevel, Task } from '@/stores/appStore';
import { TaskCard, ProofSubmissionModal } from './TaskCard';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const categories = ['All', 'Social Media', 'Video Engagement', 'Content Creation', 'Content Writing', 'Networking', 'Business Development'];

export function TaskCenter() {
  const armyLevel = useAppStore((state) => state.armyLevel);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const levelInfo = ARMY_LEVELS[armyLevel];
  const nextLevel = Object.entries(ARMY_LEVELS).find(
    ([_, info]) => info.minTasks > levelInfo.minTasks
  );

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const progressToNext = nextLevel
    ? Math.min(100, (completedTasks / nextLevel[1].minTasks) * 100)
    : 100;

  const filteredTasks = selectedCategory === 'All'
    ? tasks
    : tasks.filter((t) => t.category === selectedCategory);

  const handleOpenProofModal = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      if (task.status === 'available') {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: 'in_progress' } : t))
        );
      }
      setSelectedTask(task);
      setIsModalOpen(true);
    }
  };

  const handleSubmitProof = (taskId: string, proof: { type: string; url: string; notes: string }) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'submitted' } : t))
    );
  };

  return (
    <div className="space-y-6">
      {/* Army Level Card */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{levelInfo.icon}</span>
            <div>
              <h3 className="font-bold text-foreground">{levelInfo.name}</h3>
              <p className="text-xs text-muted-foreground">Online Army Level</p>
            </div>
          </div>
          <Badge variant="outline" className="text-alpha border-alpha">
            {completedTasks} Tasks
          </Badge>
        </div>

        {nextLevel && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Progress to {nextLevel[1].name}
              </span>
              <span className="text-foreground">
                {completedTasks}/{nextLevel[1].minTasks}
              </span>
            </div>
            <Progress value={progressToNext} className="h-2" />
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-alpha text-alpha-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Task Tabs */}
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="available" className="flex-1">
            Available ({tasks.filter((t) => t.status === 'available').length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex-1">
            Active ({tasks.filter((t) => ['in_progress', 'submitted'].includes(t.status)).length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">
            Done ({tasks.filter((t) => t.status === 'completed').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-3 mt-4">
          {filteredTasks
            .filter((t) => t.status === 'available')
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                userLevel={armyLevel}
                onSubmitProof={handleOpenProofModal}
              />
            ))}
        </TabsContent>

        <TabsContent value="active" className="space-y-3 mt-4">
          {filteredTasks
            .filter((t) => ['in_progress', 'submitted'].includes(t.status))
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                userLevel={armyLevel}
                onSubmitProof={handleOpenProofModal}
              />
            ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 mt-4">
          {filteredTasks
            .filter((t) => t.status === 'completed')
            .map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                userLevel={armyLevel}
                onSubmitProof={handleOpenProofModal}
              />
            ))}
        </TabsContent>
      </Tabs>

      <ProofSubmissionModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitProof}
      />
    </div>
  );
}
