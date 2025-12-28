import { MemberLayout } from '@/components/layouts/MemberLayout';
import { TaskCenter } from '@/components/tasks/TaskCenter';

export default function Tasks() {
  return (
    <MemberLayout title="Online Army">
      <TaskCenter />
    </MemberLayout>
  );
}
