import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  Camera,
  Link as LinkIcon,
  FileCheck,
  Loader2,
  Star,
  Info,
} from 'lucide-react';
import { useSubmitTask, Task } from '@/hooks/useTasks';
import { formatAlpha } from '@/lib/utils';

interface TaskSubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}

export function TaskSubmissionModal({
  open,
  onOpenChange,
  task,
}: TaskSubmissionModalProps) {
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofLink, setProofLink] = useState('');
  const submitTask = useSubmitTask();

  if (!task) return null;

  const isScreenshotProof = task.proof_type === 'screenshot';
  const isLinkProof = task.proof_type === 'link';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return;
      }
      setProofFile(file);
    }
  };

  const handleSubmit = async () => {
    if (isScreenshotProof && !proofFile) return;
    if (isLinkProof && !proofLink.trim()) return;

    await submitTask.mutateAsync({
      taskId: task.id,
      proofType: task.proof_type,
      proofFile: isScreenshotProof ? proofFile || undefined : undefined,
      proofLink: isLinkProof ? proofLink : undefined,
    });

    // Reset and close
    setProofFile(null);
    setProofLink('');
    onOpenChange(false);
  };

  const getProofIcon = () => {
    switch (task.proof_type) {
      case 'screenshot':
        return Camera;
      case 'link':
        return LinkIcon;
      case 'verification':
        return FileCheck;
      default:
        return Upload;
    }
  };

  const ProofIcon = getProofIcon();

  const isValid = isScreenshotProof ? !!proofFile : isLinkProof ? !!proofLink.trim() : true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <ProofIcon className="h-4 w-4 text-white" />
            </div>
            Submit Proof
          </DialogTitle>
          <DialogDescription>{task.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Task Info */}
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{task.category}</Badge>
              <Badge className="bg-emerald-500">
                <Star className="h-3 w-3 mr-1" />₳{task.reward}
              </Badge>
            </div>
          </div>

          {/* Info Alert */}
          <Alert className="border-muted bg-muted/30">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Submissions are reviewed within 48 hours. Once approved, credits will be added
              to your Task Wallet. You can only submit each task once.
            </AlertDescription>
          </Alert>

          {/* Screenshot Upload */}
          {isScreenshotProof && (
            <div className="space-y-2">
              <Label htmlFor="proof-file">Upload Screenshot</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <Input
                  id="proof-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="proof-file"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  {proofFile ? (
                    <>
                      <FileCheck className="h-8 w-8 text-emerald-500" />
                      <span className="text-sm font-medium text-foreground">
                        {proofFile.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Click to change
                      </span>
                    </>
                  ) : (
                    <>
                      <Camera className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload screenshot
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Max 5MB, JPG/PNG
                      </span>
                    </>
                  )}
                </label>
              </div>
            </div>
          )}

          {/* Link Input */}
          {isLinkProof && (
            <div className="space-y-2">
              <Label htmlFor="proof-link">Proof URL</Label>
              <Input
                id="proof-link"
                type="url"
                placeholder="https://..."
                value={proofLink}
                onChange={(e) => setProofLink(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Paste the URL that proves you completed the task
              </p>
            </div>
          )}

          {/* Verification Note */}
          {task.proof_type === 'verification' && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-xs text-amber-600">
                This task requires admin verification. Submit and an admin will verify your
                completion manually.
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!isValid || submitTask.isPending}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600"
          >
            {submitTask.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Submit for Review
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
