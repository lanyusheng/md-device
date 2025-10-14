'use client';

import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Device } from '@/types/api';
import { useDeviceStore } from '../../store/device.store';
import {
  IconCopy,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye,
  IconPackage,
  IconPackageOff,
  IconDeviceTv,
  IconLoader2
} from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { InstallApkDrawer } from '../install-apk-drawer';
import { UninstallAppsDrawer } from '../uninstall-apps-drawer';
import { deviceService } from '@/services/device.service';

interface CellActionProps {
  data: Device;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [installApkOpen, setInstallApkOpen] = useState(false);
  const [uninstallAppsOpen, setUninstallAppsOpen] = useState(false);
  const [screenMirroringUrl, setScreenMirroringUrl] = useState<string | null>(null);
  const {
    deleteDevice,
    openDrawer,
    isScreenMirroringLoading,
    setScreenMirroringLoading
  } = useDeviceStore();

  const onConfirm = async () => {
    setLoading(true);
    try {
      if (data.DeviceID) {
        await deleteDevice(data.DeviceID);
        toast.success('设备已删除');
      }
    } catch (error) {
      toast.error('删除失败');
    } finally {
      setLoading(false);
      setDeleteOpen(false);
    }
  };

  const onCopy = (id: string | null) => {
    if (id) {
      navigator.clipboard.writeText(id);
      toast.success('设备 ID 已复制到剪贴板');
    }
  };

  const onScreenMirroring = async () => {
    if (!data.DeviceID) {
      toast.error('设备 ID 不存在');
      return;
    }

    try {
      // 设置全局 loading 状态
      const deviceName = data.DeviceName || '未命名设备';
      setScreenMirroringLoading(true, deviceName);

      const response = await deviceService.startScreenMirroring(data.DeviceID);

      if (response.Code === 0 && response.Result) {
        // 使用 iframe 方式显示投屏
        let url = response.Result;

        // 如果 URL 不包含协议前缀，添加 http://
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
          url = `http://${url}`;
        }

        // 设置投屏 URL，打开模态框
        setScreenMirroringUrl(url);
        toast.success('投屏已启动');
      } else {
        toast.error(response.Message || '投屏启动失败');
      }
    } catch (error) {
      console.error('投屏失败:', error);
      toast.error('投屏失败,请重试');
    } finally {
      setScreenMirroringLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>打开菜单</span>
            <IconDotsVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>操作</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.DeviceID)}>
            <IconCopy className='mr-2 h-4 w-4' /> 复制 ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => openDrawer('view', data)}>
            <IconEye className='mr-2 h-4 w-4' /> 查看详情
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openDrawer('edit', data)}>
            <IconEdit className='mr-2 h-4 w-4' /> 编辑
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onScreenMirroring} disabled={isScreenMirroringLoading}>
            {isScreenMirroringLoading ? (
              <>
                <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                投屏启动中...
              </>
            ) : (
              <>
                <IconDeviceTv className='mr-2 h-4 w-4' />
                投屏
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setInstallApkOpen(true)}>
            <IconPackage className='mr-2 h-4 w-4' /> 安装APK
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setUninstallAppsOpen(true)}>
            <IconPackageOff className='mr-2 h-4 w-4' /> 卸载应用
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
            <IconTrash className='mr-2 h-4 w-4' /> 删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 安装APK抽屉 */}
      <InstallApkDrawer
        open={installApkOpen}
        onOpenChange={setInstallApkOpen}
        devices={[data]}
      />

      {/* 卸载应用抽屉 */}
      <UninstallAppsDrawer
        open={uninstallAppsOpen}
        onOpenChange={setUninstallAppsOpen}
        device={data}
      />

      {/* 投屏模态框 */}
      <Dialog open={!!screenMirroringUrl} onOpenChange={(open) => !open && setScreenMirroringUrl(null)}>
        <DialogContent className='max-w-[412px] w-[412px] h-[calc(100vh-4rem)] max-h-[750px] p-0 flex flex-col'>
          <DialogHeader className='px-4 pt-4 pb-2 flex-shrink-0'>
            <DialogTitle className='text-base'>
              {data.DeviceName || '未命名设备'}:{data.DeviceID}
            </DialogTitle>
          </DialogHeader>
          <div className='flex-1 overflow-hidden'>
            {screenMirroringUrl && (
              <iframe
                src={screenMirroringUrl}
                className='w-full h-full border-0'
                title={`${data.DeviceName || '未命名设备'}投屏`}
                allow='autoplay; encrypted-media'
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
