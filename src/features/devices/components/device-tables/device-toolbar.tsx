'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table } from '@tanstack/react-table';
import { Cross2Icon, ChevronDownIcon } from '@radix-ui/react-icons';
import {
  IconLayoutGrid,
  IconPackage,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconFolders,
} from '@tabler/icons-react';
import { DataTableViewOptions } from '@/components/ui/table/data-table-view-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeviceStore } from '../../store/device.store';
import { toast } from 'sonner';
import { InstallApkDrawer } from '../install-apk-drawer';
import { BatchAssignGroupDrawer } from '../batch-assign-group-drawer';
import { Device } from '@/types/api';

interface DeviceToolbarProps<TData> {
  table: Table<TData>;
}

export function DeviceToolbar<TData>({ table }: DeviceToolbarProps<TData>) {
  const router = useRouter();
  const { openDrawer, refreshDevices, batchDeleteDevices, isLoading } = useDeviceStore();
  const [installApkDrawerOpen, setInstallApkDrawerOpen] = useState(false);
  const [batchGroupDrawerOpen, setBatchGroupDrawerOpen] = useState(false);

  const tableState = table.getState();
  const isFiltered = tableState.columnFilters.length > 0 || !!tableState.globalFilter;
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelected = selectedRows.length > 0;

  const selectedDevices = useMemo(
    () => selectedRows.map((row: any) => row.original as Device),
    [selectedRows]
  );

  const selectedDeviceIds = useMemo(
    () =>
      selectedDevices
        .map((device) => device.DeviceID)
        .filter((id): id is string => Boolean(id)),
    [selectedDevices]
  );

  const handleBatchDelete = async () => {
    if (!hasSelected) return;

    if (selectedDeviceIds.length === 0) {
      toast.error('没有选中有效的设备');
      return;
    }

    try {
      await batchDeleteDevices(selectedDeviceIds);
      toast.success(`成功删除 ${selectedDeviceIds.length} 个设备`);
      table.resetRowSelection();
    } catch (error) {
      console.error('Failed to batch delete devices:', error);
      toast.error('批量删除失败');
    }
  };

  const handleBatchScreen = () => {
    if (selectedDeviceIds.length === 0) {
      toast.error('请选择至少一个可投屏的设备');
      return;
    }

    const query = encodeURIComponent(selectedDeviceIds.join(','));
    router.push(`/dashboard/batch-screen?devices=${query}`);
  };

  return (
    <div className='flex w-full items-start justify-between gap-2 p-1'>
      <div className='flex flex-1 flex-wrap items-center gap-2'>
        <Input
          placeholder='搜索设备ID、名称、IP...'
          value={tableState.globalFilter ?? ''}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className='h-8 w-40 lg:w-64'
        />

        {hasSelected && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='default'
                size='sm'
                className='h-8'
                disabled={isLoading}
              >
                批量操作 ({selectedRows.length})
                <ChevronDownIcon className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='w-48'>
              <DropdownMenuItem
                onClick={() => setInstallApkDrawerOpen(true)}
                disabled={isLoading}
              >
                <IconPackage className='mr-2 h-4 w-4' />
                批量安装APK
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleBatchScreen}
                disabled={isLoading || selectedDeviceIds.length === 0}
              >
                <IconLayoutGrid className='mr-2 h-4 w-4' />
                批量投屏
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setBatchGroupDrawerOpen(true)}
                disabled={isLoading}
              >
                <IconFolders className='mr-2 h-4 w-4' />
                批量分组
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleBatchDelete}
                disabled={isLoading}
                className='text-destructive focus:text-destructive'
              >
                <IconTrash className='mr-2 h-4 w-4' />
                删除选中
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

      <InstallApkDrawer
        open={installApkDrawerOpen}
        onOpenChange={setInstallApkDrawerOpen}
        devices={selectedDevices}
      />

      <BatchAssignGroupDrawer
        open={batchGroupDrawerOpen}
        onOpenChange={setBatchGroupDrawerOpen}
        devices={selectedDevices}
      />
    </div>
  );
}
