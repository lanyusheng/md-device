'use client';

import { DataTableFacetedFilter } from '@/components/ui/table/data-table-faceted-filter';
import { DataTableViewOptions } from '@/components/ui/table/data-table-view-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table } from '@tanstack/react-table';
import { Cross2Icon } from '@radix-ui/react-icons';
import {
  IconAlertCircle,
  IconArrowDown,
  IconArrowUp,
  IconArrowUpRight,
  IconCircle,
  IconCircleCheck,
  IconCircleDashed,
  IconCircleMinus,
  IconCircleX,
  IconFileText
} from '@tabler/icons-react';
import * as React from 'react';

interface TaskToolbarProps<TData> {
  table: Table<TData>;
}

export function TaskToolbar<TData>({ table }: TaskToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter;

  return (
    <div className='flex w-full items-start justify-between gap-2 p-1'>
      <div className='flex flex-1 flex-wrap items-center gap-2'>
        {/* 全局搜索框 */}
        <Input
          placeholder='Search all fields...'
          value={table.getState().globalFilter ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className='h-8 w-40 lg:w-64'
        />

        {/* Status 筛选 */}
        {table.getColumn('status') && (
          <DataTableFacetedFilter
            column={table.getColumn('status')}
            title='Status'
            options={[
              { label: 'Todo', value: 'todo', icon: IconCircle },
              { label: 'In Progress', value: 'in_progress', icon: IconCircleDashed },
              { label: 'Done', value: 'done', icon: IconCircleCheck },
              { label: 'Backlog', value: 'backlog', icon: IconCircleMinus },
              { label: 'Canceled', value: 'canceled', icon: IconCircleX }
            ]}
            multiple
          />
        )}

        {/* Priority 筛选 */}
        {table.getColumn('priority') && (
          <DataTableFacetedFilter
            column={table.getColumn('priority')}
            title='Priority'
            options={[
              { label: 'Low', value: 'low', icon: IconArrowDown },
              { label: 'Medium', value: 'medium', icon: IconArrowUpRight },
              { label: 'High', value: 'high', icon: IconArrowUp }
            ]}
            multiple
          />
        )}

        {/* Label 筛选 */}
        {table.getColumn('label') && (
          <DataTableFacetedFilter
            column={table.getColumn('label')}
            title='Label'
            options={[
              { label: 'Bug', value: 'bug', icon: IconAlertCircle },
              { label: 'Feature', value: 'feature', icon: IconCircle },
              { label: 'Documentation', value: 'documentation', icon: IconFileText }
            ]}
            multiple
          />
        )}

        {isFiltered && (
          <Button
            aria-label='Reset filters'
            variant='outline'
            size='sm'
            className='h-8 border-dashed px-2 lg:px-3'
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter('');
            }}
          >
            <Cross2Icon className='mr-2 h-4 w-4' />
            Reset
          </Button>
        )}
      </div>

      <div className='flex items-center gap-2'>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
