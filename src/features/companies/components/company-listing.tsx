'use client';

import { columns } from './company-tables/columns';
import { CompanyTable } from './company-tables';
import { useCompanyStore } from '../store/company.store';
import { useEffect } from 'react';

export default function CompanyListingPage() {
  const { companies, fetchCompanies, isLoading } = useCompanyStore();

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  return (
    <CompanyTable
      data={companies}
      totalItems={companies.length}
      columns={columns}
      isLoading={isLoading}
    />
  );
}
