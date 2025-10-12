'use client';

import { DataTableViewOptions } from '@/components/ui/table/data-table-view-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table } from '@tanstack/react-table';
import { Cross2Icon } from '@radix-ui/react-icons';
import {
  IconPackage,
  IconPlus,
  IconRefresh,
  IconTrash
} from '@tabler/icons-react';
import { useDeviceStore } from '../../store/device.store';
import * as React from 'react';
import { toast } from 'sonner';
import { InstallApkDrawer } from '../install-apk-drawer';
import { Device } from '@/types/api';

interface DeviceToolbarProps<TData> {
  table: Table<TData>;
}

export function DeviceToolbar<TData>({ table }: DeviceToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || table.getState().globalFilter;
  const { openDrawer, refreshDevices, batchDeleteDevices, isLoading } =
    useDeviceStore();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelected = selectedRows.length > 0;

  // 批量安装APK抽屉状态
  const [installApkDrawerOpen, setInstallApkDrawerOpen] = React.useState(false);

  const handleBatchDelete = async () => {
    if (!hasSelected) return;

    const deviceIds = selectedRows
      .map((row: any) => row.original.DeviceID)
      .filter(Boolean);

    if (deviceIds.length === 0) {
      toast.error('没有选中有效的设备');
      return;
    }

    try {
      await batchDeleteDevices(deviceIds);
      toast.success(`成功删除 ${deviceIds.length} 个设备`);
      table.resetRowSelection();
    } catch (error) {
      toast.error('批量删除失败');
    }
  };

  return (
    <div className='flex w-full items-start justify-between gap-2 p-1'>
      <div className='flex flex-1 flex-wrap items-center gap-2'>
        {/* 全局搜索框 */}
        <Input
          placeholder='搜索设备ID、名称、IP...'
          value={table.getState().globalFilter ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className='h-8 w-40 lg:w-64'
        />

        {/* 批量操作按钮 */}
        {hasSelected && (
          <>
            <Button
              variant='default'
              size='sm'
              className='h-8'
              onClick={() => setInstallApkDrawerOpen(true)}
              disabled={isLoading}
            >
              <IconPackage className='mr-2 h-4 w-4' />
              批量安装APK ({selectedRows.length})
            </Button>
            <Button
              variant='destructive'
              size='sm'
              className='h-8'
              onClick={handleBatchDelete}
              disabled={isLoading}
            >
              <IconTrash className='mr-2 h-4 w-4' />
              删除选中 ({selectedRows.length})
            </Button>
          </>
        )}

        {isFiltered && (
          <Button
            aria-label='重置筛选'
            variant='outline'
            size='sm'
            className='h-8 border-dashed px-2 lg:px-3'
            onClick={() => {
              table.resetColumnFilters();
              table.setGlobalFilter('');
            }}
          >
            <Cross2Icon className='mr-2 h-4 w-4' />
            重置
          </Button>
        )}
      </div>

      <div className='flex items-center gap-2'>
        {/* 刷新按钮 */}
        <Button
          variant='outline'
          size='sm'
          className='h-8'
          onClick={refreshDevices}
          disabled={isLoading}
        >
          <IconRefresh className='mr-2 h-4 w-4' />
          刷新
        </Button>

        {/* 新建设备按钮 */}
        <Button
          variant='default'
          size='sm'
          className='h-8'
          onClick={() => openDrawer('create')}
        >
          <IconPlus className='mr-2 h-4 w-4' />
          新建设备
        </Button>

        <DataTableViewOptions table={table} />
      </div>

      {/* 批量安装APK抽屉 */}
      <InstallApkDrawer
        open={installApkDrawerOpen}
        onOpenChange={setInstallApkDrawerOpen}
        devices={selectedRows.map((row: any) => row.original as Device)}
      />
    </div>
  );
}
