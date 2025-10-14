'use client';

import { ApkUpload } from '@/components/forms/apk-upload';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/use-media-query';
import { deviceService } from '@/services/device.service';
import { Device } from '@/types/api';
import {
  IconDeviceMobile,
  IconPackage,
  IconCheck,
  IconX,
  IconLoader2
} from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';

// 设备安装状态类型
type InstallStatus = 'pending' | 'installing' | 'success' | 'failed';

interface DeviceInstallStatus {
  deviceId: string;
  status: InstallStatus;
  message?: string;
}

interface InstallApkDrawerProps {
  /** 抽屉打开状态 */
  open: boolean;
  /** 打开状态变化回调 */
  onOpenChange: (open: boolean) => void;
  /** 要安装的设备列表 */
  devices: Device[];
}

export function InstallApkDrawer({
  open,
  onOpenChange,
  devices
}: InstallApkDrawerProps) {
  const { isDesktop } = useMediaQuery();
  const [apkUrl, setApkUrl] = useState<string | null>(null);
  const [apkFileName, setApkFileName] = useState<string>('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [deviceStatuses, setDeviceStatuses] = useState<Map<string, DeviceInstallStatus>>(new Map());

  /**
   * 处理APK上传完成
   */
  const handleUploadComplete = (url: string, fileName: string) => {
    setApkUrl(url);
    setApkFileName(fileName);
  };

  /**
   * 处理APK上传失败
   */
  const handleUploadError = (error: string) => {
    console.error('APK上传失败:', error);
    setApkUrl(null);
    setApkFileName('');
  };

  /**
   * 开始安装APK
   */
  const handleInstall = async () => {
    if (!apkUrl) {
      toast.error('请先上传APK文件');
      return;
    }

    if (devices.length === 0) {
      toast.error('请选择要安装的设备');
      return;
    }

    setIsInstalling(true);

    // 初始化所有设备状态为 installing
    const initialStatuses = new Map<string, DeviceInstallStatus>();
    devices.forEach((device) => {
      if (device.DeviceID) {
        initialStatuses.set(device.DeviceID, {
          deviceId: device.DeviceID,
          status: 'installing'
        });
      }
    });
    setDeviceStatuses(initialStatuses);

    try {
      const deviceIds = devices
        .map((d) => d.DeviceID)
        .filter(Boolean) as string[];

      const response = await deviceService.installApk({
        DeviceIdList: deviceIds,
        ApkUrl: apkUrl
      });

      // 处理最外层 Code
      if (response.Code === 0 && response.Result) {
        // 成功，解析每个设备的安装状态
        const result = response.Result;
        const updatedStatuses = new Map(initialStatuses);

        // 遍历返回的结果
        Object.keys(result).forEach((key) => {
          const deviceResult = result[key];
          const deviceId = deviceResult.deviceID;
          const resultCode = deviceResult.result?.code;

          if (deviceId) {
            updatedStatuses.set(deviceId, {
              deviceId,
              status: resultCode === 0 ? 'success' : 'failed',
              message: deviceResult.result?.message || deviceResult.result?.result
            });
          }
        });

        setDeviceStatuses(updatedStatuses);

        // 统计成功和失败数量
        const successCount = Array.from(updatedStatuses.values()).filter(
          (s) => s.status === 'success'
        ).length;
        const failedCount = Array.from(updatedStatuses.values()).filter(
          (s) => s.status === 'failed'
        ).length;

        toast.success(
          `安装完成！成功: ${successCount} 台，失败: ${failedCount} 台`
        );
      } else {
        // 整体失败
        const updatedStatuses = new Map<string, DeviceInstallStatus>();
        devices.forEach((device) => {
          if (device.DeviceID) {
            updatedStatuses.set(device.DeviceID, {
              deviceId: device.DeviceID,
              status: 'failed',
              message: response.Message || '安装失败'
            });
          }
        });
        setDeviceStatuses(updatedStatuses);
        toast.error(response.Message || '安装失败');
      }
    } catch (error) {
      console.error('安装APK失败:', error);
      // 所有设备标记为失败
      const updatedStatuses = new Map<string, DeviceInstallStatus>();
      devices.forEach((device) => {
        if (device.DeviceID) {
          updatedStatuses.set(device.DeviceID, {
            deviceId: device.DeviceID,
            status: 'failed',
            message: error instanceof Error ? error.message : '网络错误'
          });
        }
      });
      setDeviceStatuses(updatedStatuses);
      toast.error(
        error instanceof Error ? error.message : '安装失败，请稍后重试'
      );
    } finally {
      setIsInstalling(false);
    }
  };

  /**
   * 抽屉关闭时重置状态
   */
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setApkUrl(null);
      setApkFileName('');
      setDeviceStatuses(new Map());
    }
    onOpenChange(newOpen);
  };

  /**
   * 获取设备状态图标
   */
  const getStatusIcon = (deviceId: string | null) => {
    if (!deviceId) return null;
    const status = deviceStatuses.get(deviceId);
    if (!status) return null;

    switch (status.status) {
      case 'installing':
        return <IconLoader2 className='h-4 w-4 animate-spin text-blue-500' />;
      case 'success':
        return <IconCheck className='h-4 w-4 text-green-500' />;
      case 'failed':
        return <IconX className='h-4 w-4 text-red-500' />;
      default:
        return null;
    }
  };

  /**
   * 获取设备状态文本
   */
  const getStatusText = (deviceId: string | null) => {
    if (!deviceId) return null;
    const status = deviceStatuses.get(deviceId);
    if (!status) return null;

    switch (status.status) {
      case 'installing':
        return <span className='text-xs text-blue-600 dark:text-blue-400'>安装中...</span>;
      case 'success':
        return <span className='text-xs text-green-600 dark:text-green-400'>安装成功</span>;
      case 'failed':
        return (
          <span className='text-xs text-red-600 dark:text-red-400' title={status.message}>
            安装失败
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={handleOpenChange}
      direction={isDesktop ? 'right' : 'bottom'}
    >
      <DrawerContent className={isDesktop ? 'sm:max-w-lg' : ''}>
        <div
          className={
            isDesktop ? 'h-full overflow-auto' : 'mx-auto w-full max-w-2xl'
          }
        >
          <DrawerHeader>
            <DrawerTitle className='flex items-center gap-2'>
              <IconPackage className='h-5 w-5' />
              批量安装APK
            </DrawerTitle>
            <DrawerDescription>
              上传APK文件并为选中的设备批量安装应用
            </DrawerDescription>
          </DrawerHeader>

          <div className='space-y-6 p-4 pb-0'>
            {/* APK上传区域 */}
            <div className='space-y-2'>
              <h3 className='text-sm font-medium'>上传APK文件</h3>
              <ApkUpload
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                disabled={isInstalling}
              />
            </div>

            <Separator />

            {/* 设备列表 */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-medium'>目标设备</h3>
                <span className='text-muted-foreground text-xs'>
                  已选择 {devices.length} 台设备
                </span>
              </div>

              <ScrollArea className='h-[200px] rounded-lg border'>
                <div className='space-y-1 p-2'>
                  {devices.length === 0 ? (
                    <div className='flex h-[180px] items-center justify-center'>
                      <p className='text-muted-foreground text-sm'>
                        未选择任何设备
                      </p>
                    </div>
                  ) : (
                    devices.map((device) => (
                      <div
                        key={device.DeviceID}
                        className='bg-card hover:bg-accent/50 flex items-center gap-3 rounded-md border p-3 transition-colors'
                      >
                        <IconDeviceMobile className='text-muted-foreground h-4 w-4' />
                        <div className='min-w-0 flex-1'>
                          <div className='flex items-center justify-between gap-2'>
                            <p className='truncate text-sm font-medium'>
                              {device.DeviceName || device.DeviceID}
                            </p>
                            <div className='flex items-center gap-1'>
                              {getStatusIcon(device.DeviceID)}
                              {getStatusText(device.DeviceID)}
                            </div>
                          </div>
                          <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                            {device.DefaultIP && (
                              <span className='truncate'>
                                {device.DefaultIP}
                              </span>
                            )}
                            {device.DefaultIP && device.DeviceID && (
                              <span>•</span>
                            )}
                            <span className='truncate'>{device.DeviceID}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* 安装提示 */}
            {apkUrl && devices.length > 0 && (
              <div className='rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20'>
                <p className='text-xs text-blue-700 dark:text-blue-400'>
                  <strong>提示：</strong>
                  点击&quot;开始安装&quot;后，将为选中的 {devices.length} 台设备安装{' '}
                  <strong>{apkFileName}</strong>
                </p>
              </div>
            )}
          </div>

          <DrawerFooter className='flex-row gap-2'>
            <Button
              onClick={handleInstall}
              disabled={!apkUrl || devices.length === 0 || isInstalling}
              className='flex-1'
            >
              {isInstalling ? (
                <>
                  <span className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
                  安装中...
                </>
              ) : (
                '开始安装'
              )}
            </Button>
            <DrawerClose asChild>
              <Button
                variant='outline'
                className='flex-1'
                disabled={isInstalling}
              >
                取消
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
