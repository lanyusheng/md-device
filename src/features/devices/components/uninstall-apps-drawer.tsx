'use client';

import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/use-media-query';
import { deviceService } from '@/services/device.service';
import { Device } from '@/types/api';
import { IconPackageOff, IconSearch, IconX } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface UninstallAppsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device;
}

interface AppItem {
  packageName: string;
  selected: boolean;
}

export function UninstallAppsDrawer({
  open,
  onOpenChange,
  device
}: UninstallAppsDrawerProps) {
  const { isDesktop } = useMediaQuery();
  const [apps, setApps] = useState<AppItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [uninstalling, setUninstalling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // 获取设备应用列表
  const fetchApps = useCallback(async () => {
    if (!device.DeviceID) return;

    setLoading(true);
    try {
      const response = await deviceService.getPackageList(device.DeviceID);
      if (response.Result) {
        const appItems: AppItem[] = response.Result.map((packageName) => ({
          packageName,
          selected: false
        }));
        setApps(appItems);
      }
    } catch (error) {
      console.error('获取应用列表失败:', error);
      toast.error('获取应用列表失败');
    } finally {
      setLoading(false);
    }
  }, [device.DeviceID]);

  // 当抽屉打开时获取应用列表
  useEffect(() => {
    if (open) {
      fetchApps();
      setSearchKeyword('');
    }
  }, [open, fetchApps]);

  // 过滤应用列表
  const filteredApps = useMemo(() => {
    if (!searchKeyword.trim()) return apps;

    return apps.filter((app) =>
      app.packageName.toLowerCase().includes(searchKeyword.toLowerCase())
    );
  }, [apps, searchKeyword]);

  // 选中的应用
  const selectedApps = useMemo(() => {
    return apps.filter((app) => app.selected);
  }, [apps]);

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    setApps((prev) => prev.map((app) => ({ ...app, selected: checked })));
  };

  // 单个选择
  const handleSelectApp = (packageName: string, selected: boolean) => {
    setApps((prev) =>
      prev.map((app) =>
        app.packageName === packageName ? { ...app, selected } : app
      )
    );
  };

  // 显示确认对话框
  const handleUninstallClick = () => {
    if (selectedApps.length === 0) {
      toast.error('请选择要卸载的应用');
      return;
    }
    setConfirmOpen(true);
  };

  // 确认卸载应用
  const handleUninstall = async () => {
    if (!device.DeviceID) {
      toast.error('设备ID不存在');
      return;
    }

    setUninstalling(true);
    setConfirmOpen(false);

    try {
      // 逐个卸载应用
      for (const app of selectedApps) {
        await deviceService.uninstallApk({
          DeviceIdList: [device.DeviceID],
          PackageName: app.packageName
        });
      }

      toast.success(`成功卸载 ${selectedApps.length} 个应用`);
      onOpenChange(false);

      // 重新获取应用列表
      await fetchApps();
    } catch (error) {
      console.error('卸载应用失败:', error);
      toast.error('卸载应用失败');
    } finally {
      setUninstalling(false);
    }
  };

  // 清空搜索
  const clearSearch = () => {
    setSearchKeyword('');
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isDesktop ? 'right' : 'bottom'}
    >
      <DrawerContent className={isDesktop ? 'sm:max-w-md' : ''}>
        <div
          className={
            isDesktop ? 'h-full overflow-auto' : 'mx-auto w-full max-w-2xl'
          }
        >
          <DrawerHeader>
            <DrawerTitle className='flex items-center gap-2'>
              <IconPackageOff className='h-5 w-5' />
              卸载应用
            </DrawerTitle>
            <DrawerDescription>
              设备: {device.DeviceName || device.DeviceID}
            </DrawerDescription>
          </DrawerHeader>

          <div className='space-y-4 p-4 pb-0'>
            {/* 搜索框 */}
            <div className='relative'>
              <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
              <Input
                placeholder='搜索应用...'
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className='pr-10 pl-10'
              />
              {searchKeyword && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='absolute top-1/2 right-1 h-6 w-6 -translate-y-1/2 transform p-0'
                  onClick={clearSearch}
                >
                  <IconX className='h-3 w-3' />
                </Button>
              )}
            </div>

            {/* 全选控制 */}
            {filteredApps.length > 0 && (
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='select-all'
                  checked={filteredApps.every((app) => app.selected)}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor='select-all'
                  className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  全选 ({selectedApps.length}/{apps.length})
                </label>
              </div>
            )}

            <Separator />

            {/* 应用列表 */}
            <div className='space-y-2'>
              {loading ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='text-muted-foreground text-sm'>加载中...</div>
                </div>
              ) : filteredApps.length === 0 ? (
                <div className='flex items-center justify-center py-8'>
                  <div className='text-muted-foreground text-sm'>
                    {searchKeyword ? '未找到匹配的应用' : '暂无应用'}
                  </div>
                </div>
              ) : (
                <ScrollArea className='h-[300px]'>
                  <div className='space-y-2'>
                    {filteredApps.map((app) => (
                      <div
                        key={app.packageName}
                        className='hover:bg-muted/50 flex items-center space-x-2 rounded-md p-2'
                      >
                        <Checkbox
                          id={app.packageName}
                          checked={app.selected}
                          onCheckedChange={(checked) =>
                            handleSelectApp(app.packageName, !!checked)
                          }
                        />
                        <label
                          htmlFor={app.packageName}
                          className='flex-1 cursor-pointer text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                        >
                          {app.packageName}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>

          <DrawerFooter className='px-4'>
            <div className='flex flex-col gap-2 sm:flex-row sm:justify-end'>
              <DrawerClose asChild>
                <Button variant='outline'>取消</Button>
              </DrawerClose>
              <Button
                onClick={handleUninstallClick}
                disabled={selectedApps.length === 0 || uninstalling}
                className='sm:w-auto'
              >
                {uninstalling
                  ? '卸载中...'
                  : `卸载选中应用 (${selectedApps.length})`}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>

      {/* 卸载确认对话框 */}
      <AlertModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleUninstall}
        loading={uninstalling}
        title='确认卸载应用'
        description={
          <div className='space-y-2'>
            <p>您确定要卸载以下 {selectedApps.length} 个应用吗？</p>
            <div className='max-h-32 space-y-1 overflow-y-auto'>
              {selectedApps.map((app) => (
                <div
                  key={app.packageName}
                  className='text-muted-foreground text-sm'
                >
                  • {app.packageName}
                </div>
              ))}
            </div>
            <p className='text-destructive text-sm'>
              此操作不可撤销，请谨慎操作！
            </p>
          </div>
        }
      />
    </Drawer>
  );
}
