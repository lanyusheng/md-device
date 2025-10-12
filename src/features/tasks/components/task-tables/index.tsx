'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { Task } from '@/types/task';
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
import { TaskToolbar } from './task-toolbar';
import * as React from 'react';

interface TaskTableProps {
  data: Task[];
  totalItems: number;
  columns: ColumnDef<Task, unknown>[];
}

// 全局搜索过滤函数
const globalFilterFn: FilterFn<Task> = (row, columnId, filterValue) => {
  const searchValue = String(filterValue).toLowerCase();
  const searchableText =
    `${row.original.id} ${row.original.title} ${row.original.status} ${row.original.label} ${row.original.priority}`.toLowerCase();
  return searchableText.includes(searchValue);
};

export function TaskTable({ data, columns }: TaskTableProps) {
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
      <TaskToolbar table={table} />
    </DataTable>
  );
}
