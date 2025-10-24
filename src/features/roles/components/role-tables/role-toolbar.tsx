'use client';

import { DataTableViewOptions } from '@/components/ui/table/data-table-view-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table } from '@tanstack/react-table';
import { Cross2Icon } from '@radix-ui/react-icons';
import { IconRefresh, IconPlus } from '@tabler/icons-react';
import { useRoleStore } from '../../store/role.store';

interface RoleToolbarProps<TData> {
  table: Table<TData>;
  onAddClick?: () => void;
}

export function RoleToolbar<TData>({ table, onAddClick }: RoleToolbarProps<TData>) {
  const { fetchRoles, isLoading } = useRoleStore();
  const isFiltered =
    table.getState().columnFilters.length > 0 || table.getState().globalFilter;

  return (
    <div className="flex w-full items-start justify-between gap-2 p-1">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {/* 全局搜索框 */}
        <Input
          placeholder="搜索角色..."
          value={table.getState().globalFilter ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-8 w-40 lg:w-64"
        />

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
          onClick={() => fetchRoles()}
          disabled={isLoading}
        >
          <IconRefresh className="mr-2 h-4 w-4" />
          刷新
        </Button>
        {onAddClick && (
          <Button
            variant="default"
            size="sm"
            className="h-8"
            onClick={onAddClick}
          >
            <IconPlus className="mr-2 h-4 w-4" />
            新建角色
          </Button>
        )}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
