/**
 * 表格骨架屏组件
 * 用于表格数据加载时的loading效果
 */

import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  /**
   * 骨架屏行数
   * @default 5
   */
  rows?: number;
}

export function TableSkeleton({ rows = 5 }: TableSkeletonProps) {
  return (
    <div className='flex h-full flex-1 flex-col space-y-4'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-10 w-[250px]' />
        <Skeleton className='h-10 w-[150px]' />
      </div>
      <div className='relative flex flex-1'>
        <div className='absolute inset-0 flex items-center justify-center rounded-lg border bg-background'>
          <div className='flex flex-col items-center gap-3'>
            <div className='h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent' />
            <div className='text-center'>
              <p className='text-sm font-medium'>加载中...</p>
            </div>
          </div>
        </div>
      </div>
      <Skeleton className='h-10 w-full' />
    </div>
  );
}
