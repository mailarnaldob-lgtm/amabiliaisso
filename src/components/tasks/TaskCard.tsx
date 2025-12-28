import { useState } from 'react';
import { Camera, Video, Link, Clock, CheckCircle2, XCircle, Upload, X } from 'lucide-react';
import { cn, formatAlpha } from '@/lib/utils';
import { useAppStore, Task, ARMY_LEVELS, ArmyLevel } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface TaskCardProps {
  task: Task;
  userLevel: ArmyLevel;
  onSubmitProof: (taskId: string) => void;
}

const proofIcons = {
  screenshot: Camera,
  video: Video,
  link: Link,
};

const levelOrder: ArmyLevel[] = ['cadet', 'specialist', 'operative', 'vanguard', 'elite_operator'];

function canAccessTask(userLevel: ArmyLevel, requiredLevel: ArmyLevel): boolean {
  return levelOrder.indexOf(userLevel) >= levelOrder.indexOf(requiredLevel);
}

export function TaskCard({ task, userLevel, onSubmitProof }: TaskCardProps) {
  const isLocked = !canAccessTask(userLevel, task.requiredLevel);
  const ProofIcon = proofIcons[task.proofRequired];

  return (
    <div
      className={cn(
        'relative p-4 rounded-xl border transition-all duration-300',
        isLocked
          ? 'bg-secondary/50 border-border/50 opacity-60'
          : 'glass-card hover:border-primary/50'
      )}
    >
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl backdrop-blur-sm">
          <div className="text-center">
            <span className="text-2xl">{ARMY_LEVELS[task.requiredLevel].icon}</span>
            <p className="text-sm text-muted-foreground mt-1">
              Unlock at {ARMY_LEVELS[task.requiredLevel].name}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {task.category}
          </Badge>
          <Badge variant="secondary" className="text-xs flex items-center gap-1">
            <ProofIcon className="w-3 h-3" />
            {task.proofRequired}
          </Badge>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold alpha-text">₳</span>
          <span className="font-bold text-foreground">{formatAlpha(task.reward)}</span>
        </div>
      </div>

      <h3 className="font-semibold text-foreground mb-1">{task.title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{task.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{ARMY_LEVELS[task.requiredLevel].icon}</span>
          <span>{ARMY_LEVELS[task.requiredLevel].name}+</span>
        </div>

        {task.status === 'available' && !isLocked && (
          <Button
            size="sm"
            onClick={() => onSubmitProof(task.id)}
            className="alpha-gradient text-alpha-foreground"
          >
            Start Task
          </Button>
        )}
        {task.status === 'in_progress' && (
          <Button size="sm" variant="outline" onClick={() => onSubmitProof(task.id)}>
            <Upload className="w-4 h-4 mr-1" />
            Submit Proof
          </Button>
        )}
        {task.status === 'submitted' && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Under Review
          </Badge>
        )}
        {task.status === 'completed' && (
          <Badge className="bg-success text-success-foreground flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </Badge>
        )}
        {task.status === 'rejected' && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Rejected
          </Badge>
        )}
      </div>
    </div>
  );
}

interface ProofSubmissionModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskId: string, proof: { type: string; url: string; notes: string }) => void;
}

export function ProofSubmissionModal({ task, isOpen, onClose, onSubmit }: ProofSubmissionModalProps) {
  const [proofUrl, setProofUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!task) return;
    
    if (!proofUrl.trim()) {
      toast.error('Please provide proof');
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    onSubmit(task.id, {
      type: task.proofRequired,
      url: proofUrl,
      notes,
    });

    setProofUrl('');
    setNotes('');
    setIsSubmitting(false);
    onClose();
    toast.success('Proof submitted for review!');
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Proof of Work</DialogTitle>
          <DialogDescription>{task.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 rounded-lg bg-alpha/10 border border-alpha/20">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Reward</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold alpha-text">₳</span>
                <span className="text-xl font-bold">{formatAlpha(task.reward)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {task.proofRequired === 'screenshot' && 'Screenshot URL'}
              {task.proofRequired === 'video' && 'Video URL'}
              {task.proofRequired === 'link' && 'Proof Link'}
            </label>
            <Input
              placeholder={`Paste your ${task.proofRequired} URL here...`}
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Upload to Google Drive, Imgur, or any file hosting service
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional Notes (Optional)</label>
            <Textarea
              placeholder="Any additional information..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full alpha-gradient text-alpha-foreground"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Proof'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
