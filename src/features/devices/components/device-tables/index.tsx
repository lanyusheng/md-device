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

  return (
    <DataTable table={table}>
      <DeviceToolbar table={table} />
    </DataTable>
  );
}
