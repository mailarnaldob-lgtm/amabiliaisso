import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MemberEditDialog } from '@/components/admin/MemberEditDialog';
import { DeleteConfirmDialog } from '@/components/admin/DeleteConfirmDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Pencil, Trash2, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';
import { getTierDisplayLabel } from '@/lib/tierUtils';

type Profile = Tables<'profiles'>;

export default function AdminMembers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Profile | null>(null);

  const { data: members, isLoading } = useQuery({
    queryKey: ['admin-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleKyc = useMutation({
    mutationFn: async ({ id, verified }: { id: string; verified: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_kyc_verified: verified, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'KYC status updated' });
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      // Note: This won't delete the auth.users record (which requires service role)
      // But it removes the profile, effectively disabling the user
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: 'Member profile deleted' });
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
      setDeleteDialogOpen(false);
      setSelectedMember(null);
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const filteredMembers = members?.filter(
    (m) =>
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.referral_code.toLowerCase().includes(search.toLowerCase()) ||
      (m.phone && m.phone.includes(search))
  );

  const handleEdit = (member: Profile) => {
    setSelectedMember(member);
    setEditDialogOpen(true);
  };

  const handleDelete = (member: Profile) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };

  return (
    <AdminLayout
      title="Members"
      actions={
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      }
    >
      <Card className="border-border">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading members...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Referral Code</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers?.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.full_name}</TableCell>
                    <TableCell>{member.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {getTierDisplayLabel(member.membership_tier)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.is_kyc_verified ? (
                        <Badge>Verified</Badge>
                      ) : (
                        <Badge variant="secondary">Pending</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono">{member.referral_code}</TableCell>
                    <TableCell>
                      {member.created_at ? format(new Date(member.created_at), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            toggleKyc.mutate({ id: member.id, verified: !member.is_kyc_verified })
                          }
                          title={member.is_kyc_verified ? 'Revoke KYC' : 'Verify KYC'}
                        >
                          {member.is_kyc_verified ? (
                            <UserX className="h-4 w-4 text-destructive" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-primary" />
                          )}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleEdit(member)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(member)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMembers?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No members found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <MemberEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        member={selectedMember}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => selectedMember && deleteMember.mutate(selectedMember.id)}
        title="Delete Member"
        description={`Are you sure you want to delete "${selectedMember?.full_name}"? This will remove their profile data.`}
        isLoading={deleteMember.isPending}
      />
    </AdminLayout>
  );
}
