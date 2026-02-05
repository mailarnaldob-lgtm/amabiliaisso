import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  useAdminTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useToggleTaskStatus,
  Task,
  CreateTaskInput,
  TASK_CATEGORIES,
  REQUIRED_LEVELS,
  PROOF_TYPES,
  PLATFORM_CATEGORIES,
} from '@/hooks/useAdminTasks';
import {
  Target,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Coins,
  CheckCircle,
  XCircle,
  Camera,
  Link,
  FileText,
} from 'lucide-react';

const emptyFormData: CreateTaskInput = {
  title: '',
  description: '',
  category: 'Social Media',
  required_level: 'pro',
  proof_type: 'screenshot',
  reward: 10,
  is_active: true,
};

export function TaskManagementPanel() {
  const { data: tasks, isLoading } = useAdminTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const toggleStatus = useToggleTaskStatus();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<CreateTaskInput>(emptyFormData);

  const handleFormChange = (field: keyof CreateTaskInput, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    await createTask.mutateAsync(formData);
    setIsCreateOpen(false);
    setFormData(emptyFormData);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      category: task.category,
      required_level: task.required_level,
      proof_type: task.proof_type,
      reward: task.reward,
      is_active: task.is_active,
    });
  };

  const handleUpdate = async () => {
    if (!editingTask) return;
    await updateTask.mutateAsync({ id: editingTask.id, ...formData });
    setEditingTask(null);
    setFormData(emptyFormData);
  };

  const handleDelete = async () => {
    if (!deleteConfirmTask) return;
    await deleteTask.mutateAsync(deleteConfirmTask.id);
    setDeleteConfirmTask(null);
  };

  const handleToggleStatus = async (task: Task) => {
    await toggleStatus.mutateAsync({ taskId: task.id, isActive: !task.is_active });
  };

  const getProofIcon = (proofType: string) => {
    switch (proofType) {
      case 'screenshot':
        return <Camera className="h-3 w-3" />;
      case 'link':
        return <Link className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const getLevelBadgeVariant = (level: string) => {
    switch (level) {
      case 'elite':
        return 'default';
      case 'pro':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const TaskForm = ({ onSubmit, submitLabel, isSubmitting }: { 
    onSubmit: () => void; 
    submitLabel: string; 
    isSubmitting: boolean;
  }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleFormChange('title', e.target.value)}
          placeholder="e.g., Follow us on Facebook"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleFormChange('description', e.target.value)}
          placeholder="Detailed instructions for completing the task..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleFormChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {TASK_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="required_level">Required Level</Label>
          <Select
            value={formData.required_level}
            onValueChange={(value) => handleFormChange('required_level', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {REQUIRED_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="proof_type">Proof Type</Label>
          <Select
            value={formData.proof_type}
            onValueChange={(value) => handleFormChange('proof_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select proof type" />
            </SelectTrigger>
            <SelectContent>
              {PROOF_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reward">Reward (₱)</Label>
          <Input
            id="reward"
            type="number"
            min={1}
            value={formData.reward}
            onChange={(e) => handleFormChange('reward', parseInt(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between py-2">
        <div className="space-y-0.5">
          <Label>Active Status</Label>
          <p className="text-sm text-muted-foreground">
            Task will be visible to users when active
          </p>
        </div>
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => handleFormChange('is_active', checked)}
        />
      </div>

      <DialogFooter>
        <Button
          onClick={onSubmit}
          disabled={!formData.title || !formData.description || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              VPA Mission Management
            </CardTitle>
            <CardDescription>
              Create, edit, and manage VPA (Virtual Private Army) missions
            </CardDescription>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setFormData(emptyFormData)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Mission
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Mission</DialogTitle>
                <DialogDescription>
                  Add a new VPA mission for users to complete
                </DialogDescription>
              </DialogHeader>
              <TaskForm
                onSubmit={handleCreate}
                submitLabel="Create Mission"
                isSubmitting={createTask.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : tasks?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No missions created yet</p>
            <p className="text-sm">Click "Create Mission" to add your first task</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks?.map((task) => (
              <div
                key={task.id}
                className={`border rounded-lg p-4 transition-all ${
                  task.is_active 
                    ? 'border-primary/30 bg-primary/5' 
                    : 'border-border bg-muted/30 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h4 className="font-semibold text-foreground truncate">
                        {task.title}
                      </h4>
                      {task.is_active ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Inactive
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {task.description}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{task.category}</Badge>
                      <Badge variant={getLevelBadgeVariant(task.required_level)}>
                        {task.required_level.charAt(0).toUpperCase() + task.required_level.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        {getProofIcon(task.proof_type)}
                        {task.proof_type}
                      </Badge>
                      <Badge variant="secondary" className="gap-1 border-primary/30 text-primary">
                        <Coins className="h-3 w-3" />
                        ₱{task.reward}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStatus(task)}
                      disabled={toggleStatus.isPending}
                      title={task.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {task.is_active ? (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(task)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirmTask(task)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Mission</DialogTitle>
            <DialogDescription>
              Update the mission details
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            onSubmit={handleUpdate}
            submitLabel="Save Changes"
            isSubmitting={updateTask.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmTask} onOpenChange={(open) => !open && setDeleteConfirmTask(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirmTask?.title}"? This action cannot be undone.
              Any existing submissions for this task will also be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteTask.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
