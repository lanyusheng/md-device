'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import DeviceListingPage from '@/features/devices/components/device-listing';
import { DeviceGroupPanel } from '@/features/devices/components/device-group-panel';
import { DeviceGroupDrawer } from '@/features/devices/components/device-group-drawer';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

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

        <ResizablePanelGroup
          direction='horizontal'
          className='flex-1 rounded-lg border'
        >
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className='h-full p-4'>
              <DeviceGroupPanel />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={80}>
            <div className='h-full p-4'>
              <DeviceListingPage />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        <DeviceGroupDrawer />
      </div>
    </PageContainer>
  );
}
