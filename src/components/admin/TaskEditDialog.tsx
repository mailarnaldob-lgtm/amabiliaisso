import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface TaskData {
  id?: string;
  title: string;
  description: string;
  reward: number;
  category: string;
  required_level: string;
  proof_type: string;
  is_active: boolean;
}

interface TaskEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskData | null;
  mode: 'create' | 'edit';
}

const CATEGORIES = ['Social Media', 'Video Engagement', 'Content Creation', 'Content Writing', 'Networking', 'Business Development'];
const LEVELS = ['cadet', 'specialist', 'operative', 'vanguard', 'elite_operator'];
const PROOF_TYPES = ['screenshot', 'video', 'link'];

export function TaskEditDialog({ open, onOpenChange, task, mode }: TaskEditDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<TaskData>({
    title: '',
    description: '',
    reward: 0,
    category: 'Social Media',
    required_level: 'cadet',
    proof_type: 'screenshot',
    is_active: true,
  });

  useEffect(() => {
    if (task && mode === 'edit') {
      setFormData(task);
    } else if (mode === 'create') {
      setFormData({
        title: '',
        description: '',
        reward: 0,
        category: 'Social Media',
        required_level: 'cadet',
        proof_type: 'screenshot',
        is_active: true,
      });
    }
  }, [task, mode]);

  const mutation = useMutation({
    mutationFn: async (data: TaskData) => {
      if (mode === 'create') {
        const { error } = await supabase.from('tasks' as any).insert({
          title: data.title,
          description: data.description,
          reward: data.reward,
          category: data.category,
          required_level: data.required_level,
          proof_type: data.proof_type,
          is_active: data.is_active,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tasks' as any)
          .update({
            title: data.title,
            description: data.description,
            reward: data.reward,
            category: data.category,
            required_level: data.required_level,
            proof_type: data.proof_type,
            is_active: data.is_active,
          })
          .eq('id', data.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: `Task ${mode === 'create' ? 'created' : 'updated'} successfully` });
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Task' : 'Edit Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reward">Reward (₳)</Label>
              <Input
                id="reward"
                type="number"
                min="0"
                value={formData.reward}
                onChange={(e) => setFormData({ ...formData, reward: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="required_level">Required Level</Label>
              <Select
                value={formData.required_level}
                onValueChange={(value) => setFormData({ ...formData, required_level: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((level) => (
                    <SelectItem key={level} value={level} className="capitalize">
                      {level.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proof_type">Proof Type</Label>
              <Select
                value={formData.proof_type}
                onValueChange={(value) => setFormData({ ...formData, proof_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROOF_TYPES.map((type) => (
                    <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Active</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : mode === 'create' ? 'Create Task' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
