'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { LocationUser } from '@/types/permission';
import { ColumnDef, FilterFn } from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { UserToolbar } from './user-toolbar';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import * as React from 'react';

interface UserTableProps {
  data: LocationUser[];
  totalItems: number;
  columns: ColumnDef<LocationUser, unknown>[];
  isLoading?: boolean;
  onAddClick?: () => void;
}

// 全局搜索过滤函数
const globalFilterFn: FilterFn<LocationUser> = (row, columnId, filterValue) => {
  const searchValue = String(filterValue).toLowerCase();
  const searchableText = `${row.original.UID} ${row.original.UserName} ${row.original.MobilePhone} ${row.original.RoleName}`.toLowerCase();
  return searchableText.includes(searchValue);
};

export function UserTable({
  data,
  totalItems,
  columns,
  isLoading = false,
  onAddClick
}: UserTableProps) {
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
      columnVisibility
    },
    enableRowSelection: true,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters as any,
    onSortingChange: setSorting as any,
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

  // 如果正在加载，显示骨架屏
  if (isLoading && data.length === 0) {
    return <TableSkeleton />;
  }

  return (
    <DataTable table={table} isLoading={isLoading}>
      <UserToolbar table={table} onAddClick={onAddClick} />
    </DataTable>
  );
}
