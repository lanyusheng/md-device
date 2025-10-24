'use client';

import { DataTableFacetedFilter } from '@/components/ui/table/data-table-faceted-filter';
import { DataTableViewOptions } from '@/components/ui/table/data-table-view-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table } from '@tanstack/react-table';
import { Cross2Icon } from '@radix-ui/react-icons';
import { IconCircleCheck, IconCircleX, IconRefresh } from '@tabler/icons-react';
import { useCompanyStore } from '../../store/company.store';

interface CompanyToolbarProps<TData> {
  table: Table<TData>;
}

export function CompanyToolbar<TData>({ table }: CompanyToolbarProps<TData>) {
  const { fetchCompanies, isLoading } = useCompanyStore();
  const isFiltered =
    table.getState().columnFilters.length > 0 || table.getState().globalFilter;

  return (
    <div className="flex w-full items-start justify-between gap-2 p-1">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {/* 全局搜索框 */}
        <Input
          placeholder="搜索公司..."
          value={table.getState().globalFilter ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-40 lg:w-64"
        />

        {/* 状态过滤器 */}
        {table.getColumn('Status') && (
          <DataTableFacetedFilter
            column={table.getColumn('Status')}
            title="状态"
            options={[
              { label: '启用', value: 'active', icon: IconCircleCheck },
              { label: '禁用', value: 'inactive', icon: IconCircleX }
            ]}
            multiple
          />
        )}

        {/* 重置按钮 */}
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="outline"
            size="sm"
            className="h-8 border-dashed px-2 lg:px-3"
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter('');
            }}
          >
            <Cross2Icon className="mr-2 h-4 w-4" />
            重置
          </Button>
        )}
      </div>

      {/* 列显示/隐藏控制 */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={fetchCompanies}
          disabled={isLoading}
        >
          <IconRefresh className="mr-2 h-4 w-4" />
          刷新
        </Button>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
