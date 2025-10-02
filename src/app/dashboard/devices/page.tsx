'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import DeviceListingPage from '@/features/devices/components/device-listing';

export default function Page() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='设备管理'
            description='管理您的所有手机设备'
          />
        </div>
        <Separator />
        <DeviceListingPage />
      </div>
    </PageContainer>
  );
}
