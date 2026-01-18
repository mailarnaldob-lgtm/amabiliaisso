import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { TaskEditDialog } from '@/components/admin/TaskEditDialog';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { SubmissionReviewDialog } from '@/components/admin/SubmissionReviewDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Pencil, Trash2, Eye, CheckCircle, XCircle, Clock, ListTodo, FileCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface TaskRow {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: string;
  required_level: string;
  proof_type: string;
  is_active: boolean;
  created_at: string;
}

interface SubmissionRow {
  id: string;
  task_id: string;
  user_id: string;
  proof_type: string;
  proof_url: string | null;
  status: string;
  submitted_at: string;
  reward_amount: number | null;
  rejection_reason: string | null;
  reviewed_at: string | null;
  task?: {
    title: string;
    reward: number;
    category: string;
  };
  user?: {
    full_name: string;
    membership_tier: string | null;
    referred_by: string | null;
  };
}

export default function AdminTasks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionRow | null>(null);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Fetch tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['admin-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as TaskRow[];
    },
  });

  // Fetch submissions with user and task info
  const { data: submissions, isLoading: submissionsLoading } = useQuery({
    queryKey: ['admin-submissions', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('task_submissions')
        .select(`
          *,
          task:tasks(title, reward, category),
          user:profiles!task_submissions_user_id_fkey(full_name, membership_tier, referred_by)
        `)
        .order('submitted_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as SubmissionRow[];
    },
  });

  // Get submission stats
  const { data: submissionStats } = useQuery({
    queryKey: ['admin-submission-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_submissions')
        .select('status');
      if (error) throw error;
      
      const pending = data.filter(s => s.status === 'pending').length;
      const approved = data.filter(s => s.status === 'approved').length;
      const rejected = data.filter(s => s.status === 'rejected').length;
      
      return { pending, approved, rejected, total: data.length };
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Task deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['admin-tasks'] });
      setDeleteDialogOpen(false);
      setSelectedTask(null);
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const filteredTasks = tasks?.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSubmissions = submissions?.filter((s) =>
    s.task?.title?.toLowerCase().includes(submissionSearch.toLowerCase()) ||
    s.user?.full_name?.toLowerCase().includes(submissionSearch.toLowerCase())
  );

  const handleCreate = () => {
    setSelectedTask(null);
    setDialogMode('create');
    setEditDialogOpen(true);
  };

  const handleEdit = (task: TaskRow) => {
    setSelectedTask(task);
    setDialogMode('edit');
    setEditDialogOpen(true);
  };

  const handleDelete = (task: TaskRow) => {
    setSelectedTask(task);
    setDeleteDialogOpen(true);
  };

  const handleReview = (submission: SubmissionRow) => {
    setSelectedSubmission(submission);
    setReviewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AdminLayout
      title="Task Management"
      actions={
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" /> Add Task
        </Button>
      }
    >
      <Tabs defaultValue="submissions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="submissions" className="gap-2">
            <FileCheck className="h-4 w-4" />
            Submissions
            {submissionStats?.pending ? (
              <Badge variant="destructive" className="ml-1">{submissionStats.pending}</Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <ListTodo className="h-4 w-4" />
            Tasks
          </TabsTrigger>
        </TabsList>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setStatusFilter('all')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{submissionStats?.total || 0}</p>
              </CardContent>
            </Card>
            <Card className={`cursor-pointer hover:border-primary transition-colors ${statusFilter === 'pending' ? 'border-primary' : ''}`} onClick={() => setStatusFilter('pending')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-600">{submissionStats?.pending || 0}</p>
              </CardContent>
            </Card>
            <Card className={`cursor-pointer hover:border-primary transition-colors ${statusFilter === 'approved' ? 'border-primary' : ''}`} onClick={() => setStatusFilter('approved')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{submissionStats?.approved || 0}</p>
              </CardContent>
            </Card>
            <Card className={`cursor-pointer hover:border-primary transition-colors ${statusFilter === 'rejected' ? 'border-primary' : ''}`} onClick={() => setStatusFilter('rejected')}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Rejected</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-600">{submissionStats?.rejected || 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Submissions Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Task Submissions</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search submissions..."
                    className="pl-10"
                    value={submissionSearch}
                    onChange={(e) => setSubmissionSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {submissionsLoading ? (
                <div className="text-center py-8">Loading submissions...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Proof</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions?.map((submission) => (
                      <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.user?.full_name || 'Unknown'}</TableCell>
                        <TableCell className="max-w-xs truncate">{submission.task?.title || 'Unknown Task'}</TableCell>
                        <TableCell>₳{submission.task?.reward?.toLocaleString() || 0}</TableCell>
                        <TableCell className="capitalize">{submission.proof_type}</TableCell>
                        <TableCell>{getStatusBadge(submission.status)}</TableCell>
                        <TableCell>
                          {format(new Date(submission.submitted_at), 'MMM dd, HH:mm')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => handleReview(submission)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredSubmissions?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No submissions found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Tasks</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="text-center py-8">Loading tasks...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Proof</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks?.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-medium max-w-xs truncate">{task.title}</TableCell>
                        <TableCell>{task.category}</TableCell>
                        <TableCell>₳{task.reward.toLocaleString()}</TableCell>
                        <TableCell className="capitalize">{task.required_level.replace('_', ' ')}</TableCell>
                        <TableCell className="capitalize">{task.proof_type}</TableCell>
                        <TableCell>
                          <Badge variant={task.is_active ? 'default' : 'secondary'}>
                            {task.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {task.created_at ? format(new Date(task.created_at), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleEdit(task)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(task)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredTasks?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No tasks found. Click "Add Task" to create one.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <TaskEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        task={selectedTask}
        mode={dialogMode}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => selectedTask && deleteTask.mutate(selectedTask.id)}
        title="Delete Task"
        description={`Are you sure you want to delete "${selectedTask?.title}"? This action cannot be undone.`}
        isLoading={deleteTask.isPending}
      />

      <SubmissionReviewDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        submission={selectedSubmission}
      />
    </AdminLayout>
  );
}
