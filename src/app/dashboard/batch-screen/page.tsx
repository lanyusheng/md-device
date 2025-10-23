'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useDeviceStore } from '@/features/devices/store/device.store';
import { BatchScreenGrid } from '@/features/devices/components/batch-screen-grid';
import { ScreenControlToolbar } from '@/features/devices/components/screen-control-toolbar';
import { IconArrowLeft, IconX } from '@tabler/icons-react';
import { toast } from 'sonner';

export default function BatchScreenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    fetchDevices,
    batchScreenMirroringDevices,
    startBatchScreenMirroring,
    pauseBatchScreenMirroring,
    resumeBatchScreenMirroring,
    stopBatchScreenMirroring,
    isBatchScreenMirroringBusy,
  } = useDeviceStore();

  const [isInitializing, setIsInitializing] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);

  const statusSummary = useMemo(() => {
    let playing = 0;
    let paused = 0;
    let connecting = 0;
    let error = 0;

    for (const device of batchScreenMirroringDevices) {
      switch (device.status) {
        case 'playing':
          playing += 1;
          break;
        case 'paused':
          paused += 1;
          break;
        case 'connecting':
          connecting += 1;
          break;
        case 'error':
          error += 1;
          break;
        default:
          break;
      }
    }

    return {
      total: batchScreenMirroringDevices.length,
      playing,
      paused,
      connecting,
      error,
    };
  }, [batchScreenMirroringDevices]);

  useEffect(() => {
    let mounted = true;

    const initBatchScreen = async () => {
      const deviceIdsParam = searchParams.get('devices');

      if (!deviceIdsParam) {
        toast.error('请先选择设备');
        router.push('/dashboard/devices');
        return;
      }

      const deviceIds = deviceIdsParam
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

      if (deviceIds.length === 0) {
        toast.error('没有找到有效的设备');
        router.push('/dashboard/devices');
        return;
      }

      setIsInitializing(true);

      try {
        await fetchDevices();

        const allDevices = useDeviceStore.getState().devices;
        const selectedDevices = allDevices.filter((device) =>
          deviceIds.includes(device.DeviceID ?? '')
        );

        if (selectedDevices.length === 0) {
          toast.error('没有找到有效的设备');
          router.push('/dashboard/devices');
          return;
        }

        await startBatchScreenMirroring(selectedDevices);
      } catch (error) {
        console.error('Failed to initialize batch screen:', error);
        toast.error('初始化批量投屏失败');
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    void initBatchScreen();

    return () => {
      mounted = false;
      void stopBatchScreenMirroring();
    };
  }, [searchParams, fetchDevices, startBatchScreenMirroring, stopBatchScreenMirroring, router]);

  const navigateToDevices = () => router.push('/dashboard/devices');

  const handleBack = async () => {
    setIsNavigating(true);
    try {
      await stopBatchScreenMirroring();
    } catch (error) {
      console.error('Failed to stop batch screen before navigating back:', error);
    } finally {
      setIsNavigating(false);
      navigateToDevices();
    }
  };

  const handleClose = async () => {
    setIsNavigating(true);
    try {
      await stopBatchScreenMirroring();
    } catch (error) {
      console.error('Failed to stop batch screen before closing:', error);
    } finally {
      setIsNavigating(false);
      navigateToDevices();
    }
  };

  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-4'>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBack}
              className='h-9 w-9'
              disabled={isNavigating || isBatchScreenMirroringBusy}
            >
              <IconArrowLeft className='h-4 w-4' />
            </Button>
            <Heading
              title='批量投屏'
              description={`管理 ${statusSummary.total} 台设备 · 播放中 ${statusSummary.playing}`}
            />
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={handleClose}
            className='gap-2'
            disabled={isNavigating || isBatchScreenMirroringBusy}
          >
            <IconX className='h-4 w-4' />
            关闭所有投屏
          </Button>
        </div>
        <Separator />

        {isInitializing ? (
          <div className='flex h-64 items-center justify-center'>
            <p className='text-muted-foreground'>正在初始化投屏...</p>
          </div>
        ) : statusSummary.total === 0 ? (
          <div className='flex h-64 items-center justify-center'>
            <p className='text-muted-foreground'>没有活动的投屏会话</p>
          </div>
        ) : (
          <>
            <ScreenControlToolbar
              total={statusSummary.total}
              playingCount={statusSummary.playing}
              pausedCount={statusSummary.paused}
              connectingCount={statusSummary.connecting}
              errorCount={statusSummary.error}
              isBusy={isBatchScreenMirroringBusy}
              onPauseAll={() => pauseBatchScreenMirroring()}
              onResumeAll={() => resumeBatchScreenMirroring()}
              onStopAll={() => stopBatchScreenMirroring()}
            />
            <BatchScreenGrid devices={batchScreenMirroringDevices} />
          </>
        )}
      </div>
    </PageContainer>
  );
}
