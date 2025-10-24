'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import CompanyListingPage from '@/features/companies/components/company-listing';
import { useCompanyStore } from '@/features/companies/store/company.store';

export default function CompaniesPage() {
  const { currentContext } = useCompanyStore();

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="公司管理"
            description={
              currentContext.companyName
                ? `当前公司: ${currentContext.companyName}`
                : '管理租户下的所有公司'
            }
          />
        </div>
        <Separator />
        <CompanyListingPage />
      </div>
    </PageContainer>
  );
}
