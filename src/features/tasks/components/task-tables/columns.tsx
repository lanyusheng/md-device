'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Task, TaskLabel, TaskPriority, TaskStatus } from '@/types/task';
import { ColumnDef } from '@tanstack/react-table';
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsSort,
  IconCircle,
  IconCircleCheck,
  IconCircleDashed,
  IconCircleMinus,
  IconCircleX,
  IconAlertCircle,
  IconArrowUpRight,
  IconFileText,
  IconSortAscending,
  IconSortDescending
} from '@tabler/icons-react';
import { CellAction } from './cell-action';

// 状态图标映射
const statusIcons: Record<TaskStatus, React.ReactNode> = {
  todo: <IconCircle className='h-4 w-4' />,
  in_progress: <IconCircleDashed className='h-4 w-4' />,
  done: <IconCircleCheck className='h-4 w-4' />,
  backlog: <IconCircleMinus className='h-4 w-4' />,
  canceled: <IconCircleX className='h-4 w-4' />
};

// 状态标签映射
const statusLabels: Record<TaskStatus, string> = {
  todo: 'Todo',
  in_progress: 'In Progress',
  done: 'Done',
  backlog: 'Backlog',
  canceled: 'Canceled'
};

// 优先级图标映射
const priorityIcons: Record<TaskPriority, React.ReactNode> = {
  low: <IconArrowDown className='h-4 w-4 text-muted-foreground' />,
  medium: <IconArrowUpRight className='h-4 w-4' />,
  high: <IconArrowUp className='h-4 w-4 text-destructive' />
};

// 优先级标签映射
const priorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High'
};

// Label 标签映射
const labelBadgeVariants: Record<TaskLabel, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  bug: 'destructive',
  feature: 'default',
  documentation: 'secondary'
};

// 全局搜索过滤函数
function globalFilterFn(row: any, columnId: string, filterValue: string) {
  const searchValue = filterValue.toLowerCase();

  // 搜索所有文本字段
  const searchableFields = [
    row.original.id,
    row.original.title,
    row.original.status,
    row.original.label,
    row.original.priority
  ];

  return searchableFields.some(field =>
    field?.toString().toLowerCase().includes(searchValue)
  );
}

export const columns: ColumnDef<Task>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='全选'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='选择行'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'id',
    header: ({ column }) => {
      return (
        <button
          className='flex items-center gap-1 hover:text-foreground'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>Task</span>
          {column.getIsSorted() === 'asc' ? (
            <IconSortAscending className='h-4 w-4' />
          ) : column.getIsSorted() === 'desc' ? (
            <IconSortDescending className='h-4 w-4' />
          ) : (
            <IconArrowsSort className='h-4 w-4 opacity-50' />
          )}
        </button>
      );
    },
    cell: ({ row }) => (
      <div className='font-medium'>{row.getValue('id')}</div>
    ),
    enableSorting: true
  },
  {
    accessorKey: 'title',
    header: ({ column }) => {
      return (
        <button
          className='flex items-center gap-1 hover:text-foreground'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>Title</span>
          {column.getIsSorted() === 'asc' ? (
            <IconSortAscending className='h-4 w-4' />
          ) : column.getIsSorted() === 'desc' ? (
            <IconSortDescending className='h-4 w-4' />
          ) : (
            <IconArrowsSort className='h-4 w-4 opacity-50' />
          )}
        </button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className='max-w-[500px] truncate font-medium'>
          {row.getValue('title')}
        </div>
      );
    },
    enableSorting: true
  },
  {
    accessorKey: 'label',
    header: ({ column }) => {
      return (
        <button
          className='flex items-center gap-1 hover:text-foreground'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>Label</span>
          {column.getIsSorted() === 'asc' ? (
            <IconSortAscending className='h-4 w-4' />
          ) : column.getIsSorted() === 'desc' ? (
            <IconSortDescending className='h-4 w-4' />
          ) : (
            <IconArrowsSort className='h-4 w-4 opacity-50' />
          )}
        </button>
      );
    },
    cell: ({ row }) => {
      const label = row.getValue('label') as TaskLabel;
      return (
        <Badge variant={labelBadgeVariants[label]} className='capitalize'>
          {label === 'bug' && <IconAlertCircle className='mr-1 h-3 w-3' />}
          {label === 'documentation' && <IconFileText className='mr-1 h-3 w-3' />}
          {label}
        </Badge>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    meta: {
      variant: 'multiSelect',
      label: 'Label',
      options: [
        { label: 'Bug', value: 'bug', icon: IconAlertCircle },
        { label: 'Feature', value: 'feature', icon: IconCircle },
        { label: 'Documentation', value: 'documentation', icon: IconFileText }
      ]
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => {
      return (
        <button
          className='flex items-center gap-1 hover:text-foreground'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>Status</span>
          {column.getIsSorted() === 'asc' ? (
            <IconSortAscending className='h-4 w-4' />
          ) : column.getIsSorted() === 'desc' ? (
            <IconSortDescending className='h-4 w-4' />
          ) : (
            <IconArrowsSort className='h-4 w-4 opacity-50' />
          )}
        </button>
      );
    },
    cell: ({ row }) => {
      const status = row.getValue('status') as TaskStatus;
      return (
        <div className='flex items-center'>
          {statusIcons[status]}
          <span className='ml-2'>{statusLabels[status]}</span>
        </div>
      );
    },
    enableSorting: true,
    enableColumnFilter: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    meta: {
      variant: 'multiSelect',
      label: 'Status',
      options: [
        { label: 'Todo', value: 'todo', icon: IconCircle },
        { label: 'In Progress', value: 'in_progress', icon: IconCircleDashed },
        { label: 'Done', value: 'done', icon: IconCircleCheck },
        { label: 'Backlog', value: 'backlog', icon: IconCircleMinus },
        { label: 'Canceled', value: 'canceled', icon: IconCircleX }
      ]
    }
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => {
      return (
        <button
          className='flex items-center gap-1 hover:text-foreground'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>Priority</span>
          {column.getIsSorted() === 'asc' ? (
            <IconSortAscending className='h-4 w-4' />
          ) : column.getIsSorted() === 'desc' ? (
            <IconSortDescending className='h-4 w-4' />
          ) : (
            <IconArrowsSort className='h-4 w-4 opacity-50' />
          )}
        </button>
      );
    },
    cell: ({ row }) => {
      const priority = row.getValue('priority') as TaskPriority;
      return (
        <div className='flex items-center'>
          {priorityIcons[priority]}
          <span className='ml-2'>{priorityLabels[priority]}</span>
        </div>
      );
    },
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const priorityOrder = { low: 0, medium: 1, high: 2 };
      return priorityOrder[rowA.original.priority] - priorityOrder[rowB.original.priority];
    },
    enableColumnFilter: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    meta: {
      variant: 'multiSelect',
      label: 'Priority',
      options: [
        { label: 'Low', value: 'low', icon: IconArrowDown },
        { label: 'Medium', value: 'medium', icon: IconArrowUpRight },
        { label: 'High', value: 'high', icon: IconArrowUp }
      ]
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
