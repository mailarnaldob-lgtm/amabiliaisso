import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, ArrowRight, CheckCircle2, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Assignment {
  id: string;
  title: string;
  reward: number;
  status: 'available' | 'in_progress' | 'completed';
  category: string;
}

interface ActiveAssignmentsCardProps {
  assignments?: Assignment[];
  totalAvailable?: number;
  totalCompleted?: number;
}

// Mock data for demonstration
const mockAssignments: Assignment[] = [
  { id: '1', title: 'Social Media Engagement', reward: 50, status: 'available', category: 'Social' },
  { id: '2', title: 'Content Review Task', reward: 25, status: 'in_progress', category: 'Review' },
  { id: '3', title: 'Community Promotion', reward: 100, status: 'available', category: 'Marketing' },
];

export function ActiveAssignmentsCard({ 
  assignments = mockAssignments,
  totalAvailable = 12,
  totalCompleted = 8
}: ActiveAssignmentsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={cn(
        "relative overflow-hidden rounded-xl",
        "bg-card border border-border",
        "p-5"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Global Assignments</h3>
            <p className="text-xs text-muted-foreground">{totalAvailable} available tasks</p>
          </div>
        </div>
        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {totalCompleted} done
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="h-3.5 w-3.5 text-[#FFD700]" />
            <span className="text-xs text-muted-foreground">Available</span>
          </div>
          <p className="text-xl font-bold text-foreground font-mono">{totalAvailable}</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-xs text-muted-foreground">In Progress</span>
          </div>
          <p className="text-xl font-bold text-foreground font-mono">2</p>
        </div>
      </div>

      {/* Recent Assignments */}
      <div className="space-y-2 mb-4">
        {assignments.slice(0, 3).map((assignment, index) => (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg",
              "bg-muted/20 border border-border/50",
              "hover:bg-muted/40 transition-colors"
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                assignment.status === 'available' && "bg-emerald-500/10",
                assignment.status === 'in_progress' && "bg-blue-500/10",
                assignment.status === 'completed' && "bg-primary/10"
              )}>
                {assignment.status === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                ) : assignment.status === 'in_progress' ? (
                  <Clock className="h-4 w-4 text-blue-400" />
                ) : (
                  <Zap className="h-4 w-4 text-emerald-400" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{assignment.title}</p>
                <p className="text-xs text-muted-foreground">{assignment.category}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono border-[#FFD700]/30 text-[#FFD700] flex-shrink-0">
              +₳{assignment.reward}
            </Badge>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <Link to="/dashboard/market">
        <Button className="w-full gap-2 bg-primary hover:bg-primary/90 haptic-press">
          View All Assignments
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </motion.div>
  );
}
