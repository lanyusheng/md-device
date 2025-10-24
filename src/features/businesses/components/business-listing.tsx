'use client';

import { columns } from './business-tables/columns';
import { BusinessTable } from './business-tables';
import { useCompanyStore } from '@/features/companies/store/company.store';
import { useEffect } from 'react';

export default function BusinessListingPage() {
  const { businesses, fetchBusinesses, isLoading } = useCompanyStore();

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  return (
    <BusinessTable
      data={businesses}
      totalItems={businesses.length}
      columns={columns}
      isLoading={isLoading}
    />
  );
}
