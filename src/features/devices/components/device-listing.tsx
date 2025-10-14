'use client';

import { useEffect } from 'react';
import { useDeviceStore } from '../store/device.store';
import { DeviceTable } from './device-tables';
import { columns } from './device-tables/columns';
import { DeviceDrawer } from './device-drawer';

export default function DeviceListingPage() {
  const {
    devices,
    totalDevices,
    fetchDevices,
    isLoading,
    isScreenMirroringLoading,
    screenMirroringDeviceName
  } = useDeviceStore();

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return (
    <>
      {/* 投屏全局 Loading 覆盖层 */}
      {isScreenMirroringLoading && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'>
          <div className='flex flex-col items-center gap-3 rounded-lg bg-background p-6 shadow-lg border'>
            <div className='h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent' />
            <div className='text-center'>
              <p className='text-sm font-medium'>投屏启动中...</p>
              <p className='text-xs text-muted-foreground mt-1'>
                正在为 {screenMirroringDeviceName} 启动投屏
              </p>
            </div>
          </div>
        </div>
      )}

      <DeviceTable
        data={devices}
        totalItems={totalDevices}
        columns={columns}
        isLoading={isLoading}
      />
      <DeviceDrawer />
    </>
  );
}
