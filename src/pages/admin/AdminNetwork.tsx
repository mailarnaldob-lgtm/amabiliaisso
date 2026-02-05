import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
import { NetworkManagerPanel } from '@/components/admin/NetworkManagerPanel';

export default function AdminNetwork() {
  return (
    <AdminPageWrapper 
      title="NETWORK MANAGER" 
      description="MLM genealogy governance and commission management"
    >
      {() => <NetworkManagerPanel />}
    </AdminPageWrapper>
  );
}
