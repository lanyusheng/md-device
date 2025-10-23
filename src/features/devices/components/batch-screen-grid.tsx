'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { IconAlertCircle, IconLoader2, IconPlayerPause } from '@tabler/icons-react';
import { BatchScreenMirroringInfo } from '@/types/api';

// 配置：卡片宽度（可自行调整）
const CARD_WIDTH = 390; // 单位：px
// 配置：小卡片中 iframe 的缩放比例（可自行调整，0.7 表示缩小到 70%）
const CARD_IFRAME_SCALE = 0.7;

interface BatchScreenGridProps {
  devices: BatchScreenMirroringInfo[];
}

type DeviceStatus = BatchScreenMirroringInfo['status'];

const STATUS_META: Record<
  DeviceStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  playing: { label: '播放中', variant: 'default' },
  connecting: { label: '连接中', variant: 'secondary' },
  paused: { label: '已暂停', variant: 'outline' },
  error: { label: '错误', variant: 'destructive' },
};

const getStatusMeta = (status: DeviceStatus) => STATUS_META[status] ?? STATUS_META.connecting;

export function BatchScreenGrid({ devices }: BatchScreenGridProps) {
  const [expandedDeviceId, setExpandedDeviceId] = useState<string | null>(null);

  const expandedDevice = useMemo(
    () => devices.find((device) => device.DeviceID === expandedDeviceId) ?? null,
    [devices, expandedDeviceId]
  );

  const handleDeviceClick = (deviceId: string) => {
    setExpandedDeviceId(deviceId);
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setExpandedDeviceId(null);
    }
  };

  const renderCardBody = (device: BatchScreenMirroringInfo) => {
    const isLoading = device.isLoading || device.status === 'connecting';

    if (isLoading) {
      return (
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-3'>
          <IconLoader2 className='h-8 w-8 animate-spin text-primary' />
          <p className='text-sm text-muted-foreground'>正在启动投屏...</p>
        </div>
      );
    }

    if (device.status === 'error') {
      return (
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center'>
          <IconAlertCircle className='h-8 w-8 text-destructive' />
          <p className='text-sm text-muted-foreground'>
            {device.error || '投屏失败，请重试'}
          </p>
        </div>
      );
    }

    if (device.status === 'paused') {
      return (
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm'>
          <IconPlayerPause className='h-10 w-10 text-muted-foreground' />
          <p className='text-sm text-muted-foreground'>投屏已暂停</p>
          <p className='text-xs text-muted-foreground'>使用工具栏恢复投屏</p>
        </div>
      );
    }

    if (device.ScreenUrl) {
      // 计算缩放后需要的实际尺寸
      const scaleMultiplier = 1 / CARD_IFRAME_SCALE; // 如果 scale 是 0.7，则需要 1/0.7 = 1.43 倍大小
      const scaledSize = `${scaleMultiplier * 100}%`;

      return (
        <div className='absolute inset-0 overflow-hidden flex items-center justify-center'>
          <iframe
            src={device.ScreenUrl}
            className='border-0'
            title={`${device.DeviceName ?? '未命名设备'} 投屏`}
            allow='autoplay; encrypted-media'
            style={{
              width: scaledSize,
              height: scaledSize,
              transform: `scale(${CARD_IFRAME_SCALE})`,
              transformOrigin: 'center center',
            }}
          />
        </div>
      );
    }

    return (
      <div className='absolute inset-0 flex items-center justify-center'>
        <p className='text-sm text-muted-foreground'>等待投屏...</p>
      </div>
    );
  };

  const renderExpandedContent = (device: BatchScreenMirroringInfo) => {
    const isLoading = device.isLoading || device.status === 'connecting';

    if (isLoading) {
      return (
        <div className='flex h-full flex-col items-center justify-center gap-4'>
          <IconLoader2 className='h-12 w-12 animate-spin text-primary' />
          <p className='text-sm text-muted-foreground'>正在启动投屏...</p>
        </div>
      );
    }

    if (device.status === 'error') {
      return (
        <div className='flex h-full flex-col items-center justify-center gap-4 p-6 text-center'>
          <IconAlertCircle className='h-12 w-12 text-destructive' />
          <p className='text-sm text-muted-foreground'>
            {device.error || '投屏失败，请重试'}
          </p>
        </div>
      );
    }

    if (device.status === 'paused') {
      return (
        <div className='flex h-full flex-col items-center justify-center gap-4 p-6 text-center'>
          <IconPlayerPause className='h-12 w-12 text-muted-foreground' />
          <p className='text-sm text-muted-foreground'>投屏已暂停</p>
          <p className='text-xs text-muted-foreground'>在控制栏选择"恢复全部"即可继续播放</p>
        </div>
      );
    }

    // 放大查看时不缩放，显示完整尺寸
    if (device.ScreenUrl) {
      return (
        <iframe
          src={device.ScreenUrl}
          className='h-full w-full border-0'
          title={`${device.DeviceName ?? '未命名设备'} 投屏 (放大)`}
          allow='autoplay; encrypted-media'
        />
      );
    }

    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-sm text-muted-foreground'>等待投屏...</p>
      </div>
    );
  };

  return (
    <>
      {/* 投屏网格 - 响应式自动填充，动态计算能放多少个 */}
      <div
        className='grid gap-3'
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${CARD_WIDTH}px, 1fr))`
        }}
      >
        {devices.map((device) => {
          const meta = getStatusMeta(device.status);

          return (
            <Card
              key={device.DeviceID}
              className='cursor-pointer transition-all hover:shadow-lg overflow-hidden flex flex-col'
              onClick={() => handleDeviceClick(device.DeviceID)}
            >
              <CardContent className='p-2 flex flex-col flex-1 min-h-0'>
                {/* 高度比例调整：减少 50px，使用更矮的比例 */}
                <div className='relative aspect-[13/14] overflow-hidden rounded-md border bg-muted flex-shrink-0'>
                  <div className='absolute left-2 top-2 z-10'>
                    <Badge variant={meta.variant} className='text-xs px-1.5 py-0.5'>{meta.label}</Badge>
                  </div>
                  {renderCardBody(device)}
                </div>
                <div className='min-w-0 mt-1.5 flex-shrink-0'>
                  <p className='truncate text-xs font-medium leading-tight'>
                    {device.DeviceName || '未命名设备'}
                  </p>
                  <p className='truncate text-[10px] text-muted-foreground leading-tight mt-0.5'>
                    {device.DeviceID}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!expandedDevice} onOpenChange={handleDialogChange}>
        <DialogContent className='flex h-[calc(100vh-4rem)] max-h-[760px] w-[440px] max-w-[440px] flex-col overflow-hidden p-0'>
          {expandedDevice && (
            <>
              <div className='flex items-start justify-between gap-3 px-4 pb-2 pt-4'>
                <div className='min-w-0'>
                  <h3 className='text-base font-semibold'>
                    {expandedDevice.DeviceName || 'Unnamed device'}
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    {expandedDevice.DeviceID}
                  </p>
                </div>
                <Badge variant={getStatusMeta(expandedDevice.status).variant}>
                  {getStatusMeta(expandedDevice.status).label}
                </Badge>
              </div>
              <div className='flex-1 overflow-hidden'>
                {renderExpandedContent(expandedDevice)}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
