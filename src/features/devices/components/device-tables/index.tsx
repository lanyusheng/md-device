'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { Device } from '@/types/api';
import {
  ColumnDef,
  FilterFn,
  ColumnFiltersState,
  SortingState,
  VisibilityState
} from '@tanstack/react-table';
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { DeviceToolbar } from './device-toolbar';
import { Skeleton } from '@/components/ui/skeleton';
import * as React from 'react';

interface DeviceTableProps {
  data: Device[];
  totalItems: number;
  columns: ColumnDef<Device, unknown>[];
  isLoading?: boolean;
}

// 全局搜索过滤函数
const globalFilterFn: FilterFn<Device> = (row, columnId, filterValue) => {
  const searchValue = String(filterValue).toLowerCase();
  const searchableText =
    `${row.original.DeviceID} ${row.original.DeviceName} ${row.original.PublicIP} ${row.original.DefaultIP}`.toLowerCase();
  return searchableText.includes(searchValue);
};

export function DeviceTable({
  data,
  columns,
  isLoading = false
}: DeviceTableProps) {
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      columnFilters,
      sorting,
      rowSelection,
      columnVisibility
    },
    enableRowSelection: true,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  });

  // 调试输出
  React.useEffect(() => {
    console.log('[DeviceTable] data:', data);
    console.log('[DeviceTable] data.length:', data?.length);
    console.log('[DeviceTable] table.getRowModel().rows:', table.getRowModel().rows);
    console.log('[DeviceTable] table.getRowModel().rows.length:', table.getRowModel().rows?.length);
  }, [data, table]);

  // 如果正在加载，显示骨架屏
  if (isLoading && data.length === 0) {
    return (
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-10 w-[250px]' />
          <Skeleton className='h-10 w-[150px]' />
        </div>
        <div className='rounded-lg border'>
          <div className='p-4 space-y-3'>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className='h-16 w-full' />
            ))}
          </div>
        </div>
        <Skeleton className='h-10 w-full' />
      </div>
    );
  }

  return (
    <DataTable table={table} isLoading={isLoading}>
      <DeviceToolbar table={table} />
    </DataTable>
  );
}
