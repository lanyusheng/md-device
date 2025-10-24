'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import UserListingPage from '@/features/users/components/user-listing';

export default function UsersPage() {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading title="用户管理" description="管理系统用户和角色分配" />
        </div>
        <Separator />
        <UserListingPage />
      </div>
    </PageContainer>
  );
}
