'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Company } from '@/types/company';
import { IconDotsVertical, IconLogin } from '@tabler/icons-react';
import { useCompanyStore } from '../../store/company.store';

interface CellActionProps {
  data: Company;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const { switchCompany, currentContext } = useCompanyStore();

  const isCurrentCompany = currentContext.companyId === data.CompanyID;

  const handleSwitchCompany = async () => {
    if (data.Status !== 'active') {
      return;
    }
    await switchCompany(data.CompanyID, data.CompanyName);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <IconDotsVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>操作</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={handleSwitchCompany}
          disabled={isCurrentCompany || data.Status !== 'active'}
        >
          <IconLogin className="mr-2 h-4 w-4" />
          {isCurrentCompany ? '当前公司' : '进入公司'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
