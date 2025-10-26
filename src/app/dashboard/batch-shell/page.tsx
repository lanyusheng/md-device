'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { BatchShellGrid } from '@/features/devices/components/batch-shell-grid';
import { ShellControlToolbar } from '@/features/devices/components/shell-control-toolbar';
import { IconArrowLeft } from '@tabler/icons-react';
import { toast } from 'sonner';
import { deviceService } from '@/services/device.service';
import { BatchShellInfo, Device } from '@/types/api';

export default function BatchShellPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isInitializing, setIsInitializing] = useState(true);
  const [shellDevices, setShellDevices] = useState<BatchShellInfo[]>([]);
  const [isBusy, setIsBusy] = useState(false);

  const statusSummary = useMemo(() => {
    let idle = 0;
    let executing = 0;
    let success = 0;
    let error = 0;

    for (const device of shellDevices) {
      switch (device.status) {
        case 'idle':
          idle += 1;
          break;
        case 'executing':
          executing += 1;
          break;
        case 'success':
          success += 1;
          break;
        case 'error':
          error += 1;
          break;
        default:
          break;
      }
    }

    return {
      total: shellDevices.length,
      idle,
      executing,
      success,
      error,
    };
  }, [shellDevices]);

  useEffect(() => {
    const initBatchShell = async () => {
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
        // 这里应该从后端获取设备信息，暂时使用简化版本
        // 实际项目中应该调用 API 获取完整的设备信息
        const devices: Device[] = deviceIds.map((id) => ({
          DeviceID: id,
          DeviceName: `设备 ${id.substring(0, 8)}`,
        }));

        const normalizedDevices: BatchShellInfo[] = devices.map((device) => {
          const deviceId = device.DeviceID ?? '';
          const hasDeviceId = deviceId.length > 0;

          return {
            DeviceID: deviceId,
            DeviceName: device.DeviceName ?? '未命名设备',
            ShellUrl: null,
            output: '',
            isLoading: false,
            status: hasDeviceId ? 'idle' : 'error',
            error: hasDeviceId ? null : '缺少设备ID',
          };
        });

        setShellDevices(normalizedDevices);
      } catch (error) {
        console.error('Failed to initialize batch shell:', error);
        toast.error('初始化批量Shell失败');
      } finally {
        setIsInitializing(false);
      }
    };

    void initBatchShell();
  }, [searchParams, router]);

  const handleExecuteCommand = async (command: string) => {
    if (!command.trim()) {
      toast.error('请输入Shell命令');
      return;
    }

    if (shellDevices.length === 0) {
      toast.error('没有可执行的设备');
      return;
    }

    setIsBusy(true);

    // 将所有设备状态设置为 executing
    setShellDevices((prev) =>
      prev.map((device) => ({
        ...device,
        isLoading: true,
        status: 'executing' as const,
        output: '',
        error: null,
      }))
    );

    try {
      const deviceIds = shellDevices
        .map((d) => d.DeviceID)
        .filter(Boolean) as string[];

      const response = await deviceService.batchShell({
        DeviceIdList: deviceIds,
        ShellCommand: command,
      });

      // 处理响应
      if (response.Code === 0 && response.Result) {
        const result = response.Result;

        setShellDevices((prev) =>
          prev.map((device) => {
            // 在 result 中查找对应的设备结果
            const deviceResult = Object.values(result).find(
              (r) => r.deviceID === device.DeviceID
            );

            if (deviceResult) {
              const resultCode = deviceResult.result?.code;
              return {
                ...device,
                isLoading: false,
                status: resultCode === 0 ? ('success' as const) : ('error' as const),
                output: deviceResult.result?.result || '',
                error:
                  resultCode === 0
                    ? null
                    : deviceResult.result?.message || '执行失败',
              };
            }

            return {
              ...device,
              isLoading: false,
              status: 'error' as const,
              error: '未收到响应',
            };
          })
        );

        // 统计结果
        const successCount = Object.values(result).filter(
          (r) => r.result?.code === 0
        ).length;
        const failedCount = Object.values(result).length - successCount;

        toast.success(
          `执行完成！成功: ${successCount} 台，失败: ${failedCount} 台`
        );
      } else {
        // 整体失败
        setShellDevices((prev) =>
          prev.map((device) => ({
            ...device,
            isLoading: false,
            status: 'error' as const,
            error: response.Message || '执行失败',
          }))
        );
        toast.error(response.Message || '执行失败');
      }
    } catch (error) {
      console.error('Failed to execute shell command:', error);
      // 所有设备标记为失败
      setShellDevices((prev) =>
        prev.map((device) => ({
          ...device,
          isLoading: false,
          status: 'error' as const,
          error: error instanceof Error ? error.message : '网络错误',
        }))
      );
      toast.error(
        error instanceof Error ? error.message : '执行失败，请稍后重试'
      );
    } finally {
      setIsBusy(false);
    }
  };

  const handleClear = async () => {
    setShellDevices((prev) =>
      prev.map((device) => ({
        ...device,
        output: '',
        status: 'idle' as const,
        error: null,
      }))
    );
    toast.success('已清空所有输出');
  };

  const handleBack = () => {
    router.push('/dashboard/devices');
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
              disabled={isBusy}
            >
              <IconArrowLeft className='h-4 w-4' />
            </Button>
            <Heading
              title='批量Shell执行'
              description={`管理 ${statusSummary.total} 台设备 · 成功 ${statusSummary.success} · 执行中 ${statusSummary.executing}`}
            />
          </div>
        </div>
        <Separator />

        {isInitializing ? (
          <div className='flex h-64 items-center justify-center'>
            <p className='text-muted-foreground'>正在初始化...</p>
          </div>
        ) : statusSummary.total === 0 ? (
          <div className='flex h-64 items-center justify-center'>
            <p className='text-muted-foreground'>没有可用的设备</p>
          </div>
        ) : (
          <>
            <ShellControlToolbar
              total={statusSummary.total}
              idleCount={statusSummary.idle}
              executingCount={statusSummary.executing}
              successCount={statusSummary.success}
              errorCount={statusSummary.error}
              isBusy={isBusy}
              onExecute={handleExecuteCommand}
              onClear={handleClear}
            />
            <BatchShellGrid devices={shellDevices} />
          </>
        )}
      </div>
    </PageContainer>
  );
}
