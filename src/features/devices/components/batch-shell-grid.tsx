'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconAlertCircle, IconLoader2, IconCopy, IconTerminal2 } from '@tabler/icons-react';
import { BatchShellInfo } from '@/types/api';
import { toast } from 'sonner';

// 配置：卡片宽度（可自行调整）
const CARD_WIDTH = 390; // 单位：px

interface BatchShellGridProps {
  devices: BatchShellInfo[];
}

type DeviceStatus = BatchShellInfo['status'];

const STATUS_META: Record<
  DeviceStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  idle: { label: '就绪', variant: 'secondary' },
  executing: { label: '执行中', variant: 'default' },
  success: { label: '成功', variant: 'outline' },
  error: { label: '错误', variant: 'destructive' },
};

const getStatusMeta = (status: DeviceStatus) => STATUS_META[status] ?? STATUS_META.idle;

export function BatchShellGrid({ devices }: BatchShellGridProps) {
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

  const copyOutput = (output: string, deviceName: string) => {
    navigator.clipboard.writeText(output);
    toast.success(`已复制 ${deviceName} 的输出`);
  };

  const renderCardBody = (device: BatchShellInfo) => {
    const isLoading = device.isLoading || device.status === 'executing';

    if (isLoading) {
      return (
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-3'>
          <IconLoader2 className='h-8 w-8 animate-spin text-primary' />
          <p className='text-sm text-muted-foreground'>正在执行...</p>
        </div>
      );
    }

    if (device.status === 'error') {
      return (
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center'>
          <IconAlertCircle className='h-8 w-8 text-destructive' />
          <p className='text-sm text-muted-foreground'>
            {device.error || '执行失败'}
          </p>
        </div>
      );
    }

    if (device.status === 'idle') {
      return (
        <div className='absolute inset-0 flex flex-col items-center justify-center gap-3'>
          <IconTerminal2 className='h-10 w-10 text-muted-foreground' />
          <p className='text-sm text-muted-foreground'>等待执行命令</p>
        </div>
      );
    }

    // 显示命令输出
    if (device.output || device.status === 'success') {
      return (
        <div className='absolute inset-0 overflow-hidden p-2'>
          <div className='h-full w-full overflow-auto rounded-md bg-black/90 p-2'>
            <pre className='text-xs text-green-400 whitespace-pre-wrap break-words'>
              {device.output || '(无输出)'}
            </pre>
          </div>
        </div>
      );
    }

    return (
      <div className='absolute inset-0 flex items-center justify-center'>
        <p className='text-sm text-muted-foreground'>等待执行...</p>
      </div>
    );
  };

  const renderExpandedContent = (device: BatchShellInfo) => {
    const isLoading = device.isLoading || device.status === 'executing';

    if (isLoading) {
      return (
        <div className='flex h-full flex-col items-center justify-center gap-4'>
          <IconLoader2 className='h-12 w-12 animate-spin text-primary' />
          <p className='text-sm text-muted-foreground'>正在执行命令...</p>
        </div>
      );
    }

    if (device.status === 'error') {
      return (
        <div className='flex h-full flex-col items-center justify-center gap-4 p-6 text-center'>
          <IconAlertCircle className='h-12 w-12 text-destructive' />
          <p className='text-sm text-muted-foreground'>
            {device.error || '执行失败，请重试'}
          </p>
        </div>
      );
    }

    if (device.status === 'idle') {
      return (
        <div className='flex h-full flex-col items-center justify-center gap-4 p-6 text-center'>
          <IconTerminal2 className='h-12 w-12 text-muted-foreground' />
          <p className='text-sm text-muted-foreground'>等待执行命令</p>
          <p className='text-xs text-muted-foreground'>在顶部输入框中输入Shell命令并执行</p>
        </div>
      );
    }

    // 放大查看时显示完整输出
    if (device.output || device.status === 'success') {
      return (
        <div className='flex h-full w-full flex-col'>
          <div className='flex-shrink-0 border-b p-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => copyOutput(device.output, device.DeviceName)}
              className='gap-2'
            >
              <IconCopy className='h-4 w-4' />
              复制输出
            </Button>
          </div>
          <div className='flex-1 overflow-auto bg-black/90 p-4'>
            <pre className='text-sm text-green-400 whitespace-pre-wrap break-words'>
              {device.output || '(无输出)'}
            </pre>
          </div>
        </div>
      );
    }

    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-sm text-muted-foreground'>等待执行...</p>
      </div>
    );
  };

  return (
    <>
      {/* Shell网格 - 响应式自动填充，动态计算能放多少个 */}
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
                  <div className='absolute left-2 top-2 z-10 flex gap-2'>
                    <Badge variant={meta.variant} className='text-xs px-1.5 py-0.5'>{meta.label}</Badge>
                  </div>
                  {device.output && device.status === 'success' && (
                    <div className='absolute right-2 top-2 z-10'>
                      <Button
                        variant='secondary'
                        size='icon'
                        className='h-6 w-6'
                        onClick={(e) => {
                          e.stopPropagation();
                          copyOutput(device.output, device.DeviceName);
                        }}
                        title='复制输出'
                      >
                        <IconCopy className='h-3 w-3' />
                      </Button>
                    </div>
                  )}
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
        <DialogContent className='flex h-[calc(100vh-4rem)] max-h-[760px] w-[640px] max-w-[90vw] flex-col overflow-hidden p-0'>
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
