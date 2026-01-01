import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  LogOut, 
  RefreshCw,
  ExternalLink,
  FileText
} from 'lucide-react';

interface TaskProof {
  id: number;
  task_id: number;
  task_title?: string;
  user_id: number;
  user_email?: string;
  proof_text: string | null;
  proof_url: string | null;
  reward_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface Admin {
  id: number;
  username: string;
  role: string;
}

export default function TaskProofsDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [proofs, setProofs] = useState<TaskProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    // Check admin session
    const storedAdmin = localStorage.getItem('mysql_admin');
    if (!storedAdmin) {
      navigate('/admin/login');
      return;
    }
    
    try {
      setAdmin(JSON.parse(storedAdmin));
    } catch {
      navigate('/admin/login');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (admin) {
      fetchProofs(activeTab);
    }
  }, [admin, activeTab]);

  const fetchProofs = async (status: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mysql-task-proofs', {
        body: null,
        headers: {}
      });

      // Use query params approach
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mysql-task-proofs?status=${status}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch proofs');
      }

      const result = await response.json();
      
      if (result.proofs) {
        setProofs(result.proofs);
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (err) {
      console.error('Fetch proofs error:', err);
      toast.error('Failed to load task proofs');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (proofId: number) => {
    if (!admin) return;
    
    setApproving(proofId);
    try {
      const { data, error } = await supabase.functions.invoke('mysql-approve-proof', {
        body: { proof_id: proofId, admin_id: admin.id }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast.success('Task proof approved and paid!');
        // Remove from list or refresh
        setProofs(prev => prev.filter(p => p.id !== proofId));
      } else {
        toast.error(data?.error || 'Failed to approve');
      }
    } catch (err) {
      console.error('Approve error:', err);
      toast.error('Failed to approve proof');
    } finally {
      setApproving(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mysql_admin');
    navigate('/admin/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = proofs.filter(p => p.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Task Proofs Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Logged in as <span className="font-medium">{admin?.username}</span> ({admin?.role})
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Proofs</CardDescription>
              <CardTitle className="text-3xl">{proofs.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Rewards</CardDescription>
              <CardTitle className="text-3xl">
                ₳{proofs.reduce((sum, p) => sum + (p.reward_amount || 0), 0).toLocaleString()}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Task Proofs Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Task Proofs</CardTitle>
              <CardDescription>Review and approve submitted task proofs</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => fetchProofs(activeTab)} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending">
                  Pending {pendingCount > 0 && <Badge className="ml-2" variant="destructive">{pendingCount}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : proofs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No {activeTab} proofs found</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Task</TableHead>
                          <TableHead>Proof</TableHead>
                          <TableHead>Reward</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {proofs.map((proof) => (
                          <TableRow key={proof.id}>
                            <TableCell className="font-mono text-sm">#{proof.id}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="font-medium">User #{proof.user_id}</p>
                                {proof.user_email && (
                                  <p className="text-muted-foreground text-xs">{proof.user_email}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p>Task #{proof.task_id}</p>
                                {proof.task_title && (
                                  <p className="text-muted-foreground text-xs">{proof.task_title}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px]">
                                {proof.proof_url ? (
                                  <a 
                                    href={proof.proof_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-1 text-sm"
                                  >
                                    View Proof <ExternalLink className="w-3 h-3" />
                                  </a>
                                ) : proof.proof_text ? (
                                  <p className="text-sm truncate" title={proof.proof_text}>
                                    {proof.proof_text}
                                  </p>
                                ) : (
                                  <span className="text-muted-foreground text-sm">No proof</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              ₳{proof.reward_amount?.toLocaleString() || 0}
                            </TableCell>
                            <TableCell>{getStatusBadge(proof.status)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(proof.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {proof.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleApprove(proof.id)}
                                    disabled={approving === proof.id}
                                  >
                                    {approving === proof.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Approve
                                      </>
                                    )}
                                  </Button>
                                  <Button size="sm" variant="outline" className="text-destructive">
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
