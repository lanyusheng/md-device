'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Role } from '@/types/permission';
import { ColumnDef } from '@tanstack/react-table';
import {
  IconSortAscending,
  IconSortDescending,
  IconArrowsSort
} from '@tabler/icons-react';
import { CellAction } from './cell-action';

export const columns: ColumnDef<Role>[] = [
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

  // 角色ID列
  {
    accessorKey: 'RoleID',
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span>角色ID</span>
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
      <div className="font-medium">{row.getValue('RoleID')}</div>
    ),
    enableSorting: true
  },

  // 角色名称列
  {
    accessorKey: 'RoleName',
    header: ({ column }) => (
      <button
        className="flex items-center gap-1 hover:text-foreground"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span>角色名称</span>
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
        {row.getValue('RoleName')}
      </div>
    ),
    enableSorting: true
  },

  // 描述列
  {
    accessorKey: 'Description',
    header: '描述',
    cell: ({ row }) => {
      const description = row.getValue('Description') as string;
      return (
        <div className="max-w-[400px] truncate" title={description}>
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
