'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Company, CompanyStatus } from '@/types/company';
import { ColumnDef } from '@tanstack/react-table';
import {
  IconSortAscending,
  IconSortDescending,
  IconArrowsSort,
  IconCircleCheck,
  IconCircleX
} from '@tabler/icons-react';
import { CellAction } from './cell-action';

// 状态样式映射
const statusVariants: Record<
  CompanyStatus,
  'default' | 'secondary' | 'destructive'
> = {
  active: 'default',
  inactive: 'secondary'
};

// 状态图标映射
const statusIcons: Record<CompanyStatus, React.ReactNode> = {
  active: <IconCircleCheck className="mr-1 h-4 w-4" />,
  inactive: <IconCircleX className="mr-1 h-4 w-4" />
};

// 状态标签映射
const statusLabels: Record<CompanyStatus, string> = {
  active: '启用',
  inactive: '禁用'
};

export const columns: ColumnDef<Company>[] = [
  // 选择框列
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },

  // 公司ID列
  {
    accessorKey: 'CompanyID',
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span>公司ID</span>
        {column.getIsSorted() === 'asc' ? (
          <IconSortAscending className="h-4 w-4" />
        ) : column.getIsSorted() === 'desc' ? (
          <IconSortDescending className="h-4 w-4" />
        ) : (
          <IconArrowsSort className="h-4 w-4 opacity-50" />
        )}
      </button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('CompanyID')}</div>
    ),
    enableSorting: true
  },

  // 公司名称列
  {
    accessorKey: 'CompanyName',
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span>公司名称</span>
        {column.getIsSorted() === 'asc' ? (
          <IconSortAscending className="h-4 w-4" />
        ) : column.getIsSorted() === 'desc' ? (
          <IconSortDescending className="h-4 w-4" />
        ) : (
          <IconArrowsSort className="h-4 w-4 opacity-50" />
        )}
      </button>
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate font-medium">
        {row.getValue('CompanyName')}
      </div>
    ),
    enableSorting: true
  },

  // 租户ID列
  {
    accessorKey: 'TenantID',
    header: '租户ID',
    cell: ({ row }) => <div>{row.getValue('TenantID')}</div>
  },

  // 状态列
  {
    accessorKey: 'Status',
    header: '状态',
    cell: ({ row }) => {
      const status = row.getValue('Status') as CompanyStatus;
      return (
        <Badge
          variant={statusVariants[status]}
          className="flex w-fit items-center gap-1"
        >
          {statusIcons[status]}
          <span>{statusLabels[status]}</span>
        </Badge>
      );
    },
    enableColumnFilter: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },

  // 描述列
  {
    accessorKey: 'Description',
    header: '描述',
    cell: ({ row }) => {
      const description = row.getValue('Description') as string;
      return (
        <div className="max-w-[200px] truncate" title={description}>
          {description || '-'}
        </div>
      );
    }
  },

  // 创建时间列
  {
    accessorKey: 'CreateTime',
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span>创建时间</span>
        {column.getIsSorted() === 'asc' ? (
          <IconSortAscending className="h-4 w-4" />
        ) : column.getIsSorted() === 'desc' ? (
          <IconSortDescending className="h-4 w-4" />
        ) : (
          <IconArrowsSort className="h-4 w-4 opacity-50" />
        )}
      </button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('CreateTime'));
      return (
        <div className="whitespace-nowrap">
          {date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      );
    },
    enableSorting: true
  },

  // 操作列
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
