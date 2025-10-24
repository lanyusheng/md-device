'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Business } from '@/types/company';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const columns: ColumnDef<Business>[] = [
  {
    accessorKey: 'BusinessID',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="业务ID" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('BusinessID')}</div>
    ),
    enableSorting: true,
    enableHiding: false
  },
  {
    accessorKey: 'BusinessName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="业务名称" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue('BusinessName')}
          </span>
        </div>
      );
    }
  },
  {
    accessorKey: 'CompanyName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="所属公司" />
    ),
    cell: ({ row }) => {
      const companyName = row.getValue('CompanyName') as string;
      return companyName ? (
        <div className="text-muted-foreground">{companyName}</div>
      ) : (
        <div className="text-muted-foreground">-</div>
      );
    }
  },
  {
    accessorKey: 'Status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="状态" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('Status') as string;
      return (
        <Badge
          variant="outline"
          className={cn(
            'capitalize',
            status === 'active'
              ? 'border-green-600/20 bg-green-50 text-green-700 dark:border-green-400/30 dark:bg-green-950 dark:text-green-400'
              : 'border-gray-600/20 bg-gray-50 text-gray-700 dark:border-gray-400/30 dark:bg-gray-950 dark:text-gray-400'
          )}
        >
          {status === 'active' ? '启用' : '禁用'}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },
  {
    accessorKey: 'Description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="描述" />
    ),
    cell: ({ row }) => {
      const description = row.getValue('Description') as string;
      return description ? (
        <div className="max-w-[300px] truncate text-muted-foreground">
          {description}
        </div>
      ) : (
        <div className="text-muted-foreground">-</div>
      );
    }
  },
  {
    accessorKey: 'Sort',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="排序" />
    ),
    cell: ({ row }) => {
      const sort = row.getValue('Sort') as number;
      return sort !== undefined ? (
        <div className="text-muted-foreground">{sort}</div>
      ) : (
        <div className="text-muted-foreground">-</div>
      );
    },
    enableSorting: true
  },
  {
    accessorKey: 'CreateTime',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="创建时间" />
    ),
    cell: ({ row }) => {
      const createTime = row.getValue('CreateTime') as string;
      return createTime ? (
        <div className="text-muted-foreground">
          {new Date(createTime).toLocaleString('zh-CN')}
        </div>
      ) : (
        <div className="text-muted-foreground">-</div>
      );
    },
    enableSorting: true
  }
];
