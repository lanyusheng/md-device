'use client';

import { useEffect } from 'react';
import { useDeviceStore } from '../store/device.store';
import { DeviceTable } from './device-tables';
import { columns } from './device-tables/columns';
import { DeviceDrawer } from './device-drawer';

export default function DeviceListingPage() {
  const { devices, totalDevices, fetchDevices, isLoading } = useDeviceStore();

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return (
    <>
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
