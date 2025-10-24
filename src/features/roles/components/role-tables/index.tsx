'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { Role } from '@/types/permission';
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
import { RoleToolbar } from './role-toolbar';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import * as React from 'react';

interface RoleTableProps {
  data: Role[];
  totalItems: number;
  columns: ColumnDef<Role, unknown>[];
  isLoading?: boolean;
  onAddClick?: () => void;
}

// 全局搜索过滤函数
const globalFilterFn: FilterFn<Role> = (row, columnId, filterValue) => {
  const searchValue = String(filterValue).toLowerCase();
  const searchableText = `${row.original.RoleID} ${row.original.RoleName} ${row.original.Description || ''}`.toLowerCase();
  return searchableText.includes(searchValue);
};

export function RoleTable({
  data,
  totalItems,
  columns,
  isLoading = false,
  onAddClick
}: RoleTableProps) {
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
      <RoleToolbar table={table} onAddClick={onAddClick} />
    </DataTable>
  );
}
