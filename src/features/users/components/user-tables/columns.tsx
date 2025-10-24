'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { LocationUser, UserStatus } from '@/types/permission';
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
  UserStatus,
  'default' | 'secondary' | 'destructive'
> = {
  active: 'default',
  inactive: 'secondary'
};

// 状态图标映射
const statusIcons: Record<UserStatus, React.ReactNode> = {
  active: <IconCircleCheck className="mr-1 h-4 w-4" />,
  inactive: <IconCircleX className="mr-1 h-4 w-4" />
};

// 状态标签映射
const statusLabels: Record<UserStatus, string> = {
  active: '启用',
  inactive: '禁用'
};

export const columns: ColumnDef<LocationUser>[] = [
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

  // 用户ID列
  {
    accessorKey: 'UID',
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span>用户ID</span>
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
      <div className="max-w-[200px] truncate font-mono text-xs">
        {row.getValue('UID')}
      </div>
    ),
    enableSorting: true
  },

  // 用户名列
  {
    accessorKey: 'UserName',
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span>用户名</span>
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
      <div className="font-medium">{row.getValue('UserName')}</div>
    ),
    enableSorting: true
  },

  // 手机号列
  {
    accessorKey: 'MobilePhone',
    header: '手机号',
    cell: ({ row }) => {
      const phone = row.getValue('MobilePhone') as string;
      return <div className="font-mono text-sm">{phone || '-'}</div>;
    }
  },

  // 角色列
  {
    accessorKey: 'RoleName',
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span>角色</span>
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
      const roleName = row.getValue('RoleName') as string;
      return (
        <Badge variant="outline" className="font-normal">
          {roleName || '未分配'}
        </Badge>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    }
  },

  // 状态列
  {
    accessorKey: 'Status',
    header: '状态',
    cell: ({ row }) => {
      const status = row.getValue('Status') as UserStatus;
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
      const dateStr = row.getValue('CreateTime') as string;
      if (!dateStr) return '-';

      const date = new Date(dateStr);
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
