'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { Device } from '@/types/api';
import { ColumnDef, FilterFn } from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
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
  const searchableText = `${row.original.DeviceID} ${row.original.DeviceName} ${row.original.PublicIP} ${row.original.DefaultIP}`.toLowerCase();
  return searchableText.includes(searchValue);
};

export function DeviceTable({
  data,
  totalItems,
  columns,
  isLoading = false,
}: DeviceTableProps) {
  const [pageSize] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [sorting, setSorting] = React.useState([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      columnFilters,
      sorting,
      rowSelection,
      columnVisibility,
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
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <DataTable table={table} isLoading={isLoading}>
      <DeviceToolbar table={table} />
    </DataTable>
  );
}
