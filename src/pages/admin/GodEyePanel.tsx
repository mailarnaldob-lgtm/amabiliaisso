import { AdminPageWrapper } from '@/components/admin/AdminPageWrapper';
import { AdminCROPanel } from '@/components/alpha/AdminCROPanel';

export default function GodEyePanel() {
  return (
    <AdminPageWrapper 
      title="GOD-EYE OVERSIGHT" 
      description="System monitoring and advanced controls"
    >
      {() => (
        <AdminCROPanel />
      )}
    </AdminPageWrapper>
  );
}
