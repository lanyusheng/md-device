'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import RoleListingPage from '@/features/roles/components/role-listing';

export default function RolesPage() {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading title="角色管理" description="管理系统角色和权限" />
        </div>
        <Separator />
        <RoleListingPage />
      </div>
    </PageContainer>
  );
}
