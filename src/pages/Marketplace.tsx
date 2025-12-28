import { MemberLayout } from '@/components/layouts/MemberLayout';
import { LendingMarketplace } from '@/components/lending/LendingMarketplace';

export default function Marketplace() {
  return (
    <MemberLayout title="P2P Lending">
      <LendingMarketplace />
    </MemberLayout>
  );
}
