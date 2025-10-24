'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import BusinessListingPage from '@/features/businesses/components/business-listing';
import { useCompanyStore } from '@/features/companies/store/company.store';

export default function BusinessesPage() {
  const { currentContext } = useCompanyStore();

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="业务管理"
            description={
              currentContext.companyName
                ? `管理 ${currentContext.companyName} 的业务列表`
                : '管理当前公司的业务列表'
            }
          />
        </div>
        <Separator />
        <BusinessListingPage />
      </div>
    </PageContainer>
  );
}
