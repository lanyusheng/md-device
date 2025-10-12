'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Device } from '@/types/api';
import { ColumnDef } from '@tanstack/react-table';
import {
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
  IconDeviceDesktop,
  IconBattery,
  IconWifi
} from '@tabler/icons-react';
import { CellAction } from './cell-action';

/**
 * 格式化百分比
 */
const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * 格式化时间
 */
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * 获取进度条颜色类
 */
const getProgressColor = (
  percent: number,
  type: 'cpu' | 'memory' | 'battery'
): string => {
  if (type === 'battery') {
    // 电量：高=绿色，中=黄色，低=红色
    if (percent >= 50) return 'bg-green-500';
    if (percent >= 20) return 'bg-yellow-500';
    return 'bg-red-500';
  } else {
    // CPU/内存：低=绿色，中=黄色，高=红色
    if (percent < 60) return 'bg-green-500';
    if (percent < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  }
};

/**
 * 判断设备是否在线（根据更新时间判断，5分钟内更新过的视为在线）
 */
const isDeviceOnline = (updateTime: string): boolean => {
  const lastUpdate = new Date(updateTime).getTime();
  const now = new Date().getTime();
  const fiveMinutes = 5 * 60 * 1000;
  return now - lastUpdate < fiveMinutes;
};

export const columns: ColumnDef<Device>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='全选'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='选择行'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: 'UpdateTime',
    header: '状态',
    cell: ({ row }) => {
      const online = isDeviceOnline(row.getValue('UpdateTime'));
      return (
        <div className='flex items-center gap-1.5'>
          <div
            className={`h-2 w-2 rounded-full ${online ? 'bg-green-500' : 'bg-gray-400'}`}
          />
          <span
            className={`text-xs ${online ? 'text-green-600' : 'text-gray-500'}`}
          >
            {online ? '在线' : '离线'}
          </span>
        </div>
      );
    },
    enableSorting: false
  },
  {
    accessorKey: 'DeviceID',
    header: ({ column }) => {
      return (
        <button
          className='hover:text-foreground flex items-center gap-1'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>设备ID</span>
          {column.getIsSorted() === 'asc' ? (
            <IconSortAscending className='h-4 w-4' />
          ) : column.getIsSorted() === 'desc' ? (
            <IconSortDescending className='h-4 w-4' />
          ) : (
            <IconArrowsSort className='h-4 w-4 opacity-50' />
          )}
        </button>
      );
    },
    cell: ({ row }) => (
      <div className='font-mono text-sm'>{row.getValue('DeviceID')}</div>
    ),
    enableSorting: true
  },
  {
    accessorKey: 'DeviceName',
    header: ({ column }) => {
      return (
        <button
          className='hover:text-foreground flex items-center gap-1'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <IconDeviceDesktop className='h-4 w-4' />
          <span>设备名称</span>
          {column.getIsSorted() === 'asc' ? (
            <IconSortAscending className='h-4 w-4' />
          ) : column.getIsSorted() === 'desc' ? (
            <IconSortDescending className='h-4 w-4' />
          ) : (
            <IconArrowsSort className='h-4 w-4 opacity-50' />
          )}
        </button>
      );
    },
    cell: ({ row }) => {
      return (
        <div className='max-w-[200px] truncate font-medium'>
          {row.getValue('DeviceName') || '未命名设备'}
        </div>
      );
    },
    enableSorting: true
  },
  // {
  //   accessorKey: 'CpuPercent',
  //   header: ({ column }) => {
  //     return (
  //       <button
  //         className='hover:text-foreground flex items-center gap-1'
  //         onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
  //       >
  //         <IconCpu className='h-4 w-4' />
  //         <span>CPU使用率</span>
  //         {column.getIsSorted() === 'asc' ? (
  //           <IconSortAscending className='h-4 w-4' />
  //         ) : column.getIsSorted() === 'desc' ? (
  //           <IconSortDescending className='h-4 w-4' />
  //         ) : (
  //           <IconArrowsSort className='h-4 w-4 opacity-50' />
  //         )}
  //       </button>
  //     );
  //   },
  //   cell: ({ row }) => {
  //     const percent = row.getValue('CpuPercent') as number;
  //     const colorClass = getProgressColor(percent, 'cpu');
  //     return (
  //     <div className='w-[120px]'>
  //       <div className='flex items-center justify-between text-xs h-[18px]'>
  //         <span className='font-medium'>{formatPercent(row.original.percent)}</span>
  //         <span className='text-muted-foreground'>{row.original.CpuCount}GB</span>
  //       </div>
  //       <div className='bg-secondary h-2 w-full overflow-hidden rounded-full mt-1'>
  //         <div
  //             className={`h-full ${colorClass} transition-all duration-300`}
  //             style={{ width: `${Math.min(row.original.percent, 100)}%` }}
  //         />
  //       </div>
  //     </div>
  //     );
  //   },
  //   enableSorting: true
  // },
  {
    accessorKey: 'CpuPercent',
    header: ({ column }) => {
      return (
        <button
          className='hover:text-foreground flex items-center gap-1'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>CPU使用率</span>
          {column.getIsSorted() === 'asc' ? (
            <IconSortAscending className='h-4 w-4' />
          ) : column.getIsSorted() === 'desc' ? (
            <IconSortDescending className='h-4 w-4' />
          ) : (
            <IconArrowsSort className='h-4 w-4 opacity-50' />
          )}
        </button>
      );
    },
    cell: ({ row }) => {
      const percent = row.getValue('CpuPercent') as number;
      const total = row.original.CpuCount;
      const colorClass = getProgressColor(percent, 'memory');
      return (
        <div className='w-[120px]'>
          <div className='flex h-[18px] items-center justify-between text-xs'>
            <span className='font-medium'>{formatPercent(percent)}</span>
            <span className='text-muted-foreground'>{total}GB</span>
          </div>
          <div className='bg-secondary mt-1 h-2 w-full overflow-hidden rounded-full'>
            <div
              className={`h-full ${colorClass} transition-all duration-300`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </div>
      );
    },
    enableSorting: true
  },
  {
    accessorKey: 'MemPercent',
    header: ({ column }) => {
      return (
        <button
          className='hover:text-foreground flex items-center gap-1'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>内存使用率</span>
          {column.getIsSorted() === 'asc' ? (
            <IconSortAscending className='h-4 w-4' />
          ) : column.getIsSorted() === 'desc' ? (
            <IconSortDescending className='h-4 w-4' />
          ) : (
            <IconArrowsSort className='h-4 w-4 opacity-50' />
          )}
        </button>
      );
    },
    cell: ({ row }) => {
      const percent = row.getValue('MemPercent') as number;
      const total = row.original.MemTotal;
      const colorClass = getProgressColor(percent, 'memory');
      return (
        <div className='w-[120px]'>
          <div className='flex h-[18px] items-center justify-between text-xs'>
            <span className='font-medium'>{formatPercent(percent)}</span>
            <span className='text-muted-foreground'>{total}GB</span>
          </div>
          <div className='bg-secondary mt-1 h-2 w-full overflow-hidden rounded-full'>
            <div
              className={`h-full ${colorClass} transition-all duration-300`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </div>
      );
    },
    enableSorting: true
  },
  {
    accessorKey: 'BatteryPercent',
    header: ({ column }) => {
      return (
        <button
          className='hover:text-foreground flex items-center gap-1'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <IconBattery className='h-4 w-4' />
          <span>电量</span>
          {column.getIsSorted() === 'asc' ? (
            <IconSortAscending className='h-4 w-4' />
          ) : column.getIsSorted() === 'desc' ? (
            <IconSortDescending className='h-4 w-4' />
          ) : (
            <IconArrowsSort className='h-4 w-4 opacity-50' />
          )}
        </button>
      );
    },
    cell: ({ row }) => {
      const percent = row.getValue('BatteryPercent') as number;
      const colorClass = getProgressColor(percent, 'battery');
      return (
        <div className='w-[100px]'>
          <div className='flex h-[18px] items-center justify-between text-xs'>
            <span className='font-medium'>{formatPercent(percent)}</span>
            <IconBattery className='text-muted-foreground h-3 w-3' />
          </div>
          <div className='bg-secondary mt-1 h-2 w-full overflow-hidden rounded-full'>
            <div
              className={`h-full ${colorClass} transition-all duration-300`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        </div>
      );
    },
    enableSorting: true
  },
  {
    accessorKey: 'PublicIP',
    header: ({ column }) => {
      return (
        <button
          className='hover:text-foreground flex items-center gap-1'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <IconWifi className='h-4 w-4' />
          <span>IP:端口</span>
          {column.getIsSorted() === 'asc' ? (
            <IconSortAscending className='h-4 w-4' />
          ) : column.getIsSorted() === 'desc' ? (
            <IconSortDescending className='h-4 w-4' />
          ) : (
            <IconArrowsSort className='h-4 w-4 opacity-50' />
          )}
        </button>
      );
    },
    cell: ({ row }) => {
      const defaultIP = row.original.DefaultIP;

      return (
        <div className='font-mono text-sm'>
          {defaultIP ? (
            <div className='text-muted-foreground mt-1 flex h-[18px] items-center text-xs'>
              {defaultIP}:{row.original.ServicePort}
            </div>
          ) : (
            <div className='invisible mt-1 h-[18px] text-xs'>placeholder</div>
          )}
        </div>
      );
    },
    enableSorting: true
  },
  {
    accessorKey: 'UpdateTime',
    header: ({ column }) => {
      return (
        <button
          className='hover:text-foreground flex items-center gap-1'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>更新时间</span>
          {column.getIsSorted() === 'asc' ? (
            <IconSortAscending className='h-4 w-4' />
          ) : column.getIsSorted() === 'desc' ? (
            <IconSortDescending className='h-4 w-4' />
          ) : (
            <IconArrowsSort className='h-4 w-4 opacity-50' />
          )}
        </button>
      );
    },
    cell: ({ row }) => {
      const updateTime = row.getValue('UpdateTime') as string;
      return (
        <span className='text-muted-foreground text-sm'>
          {formatDateTime(updateTime)}
        </span>
      );
    },
    enableSorting: true
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
