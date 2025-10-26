'use client';

import { useEffect, useState } from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useDeviceStore } from '../store/device.store';
import { toast } from 'sonner';
import { Device } from '@/types/api';
import { IconEdit, IconServer, IconPlugConnected, IconNote } from '@tabler/icons-react';

interface BatchEditDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devices: Device[];
}

export function BatchEditDrawer({
  open,
  onOpenChange,
  devices
}: BatchEditDrawerProps) {
  const { isDesktop } = useMediaQuery();
  const { batchUpdateDeviceFields, isLoading } = useDeviceStore();

  const [cabinetID, setCabinetID] = useState<string>('');
  const [slotID, setSlotID] = useState<string>('');
  const [remark, setRemark] = useState<string>('');

  useEffect(() => {
    if (open) {
      // 打开时重置表单
      setCabinetID('');
      setSlotID('');
      setRemark('');
    }
  }, [open]);

  const handleSubmit = async () => {
    // 检查至少填写了一个字段
    if (!cabinetID.trim() && !slotID.trim() && !remark.trim()) {
      toast.error('请至少填写一个字段');
      return;
    }

    if (devices.length === 0) {
      toast.error('没有选中的设备');
      return;
    }

    try {
      const updateData: any = {};

      // 只添加有值的字段
      if (cabinetID.trim()) {
        updateData.CabinetID = cabinetID.trim();
      }
      if (slotID.trim()) {
        updateData.SlotID = slotID.trim();
      }
      if (remark.trim()) {
        updateData.Remark = remark.trim();
      }

      const deviceIds = devices
        .map((d) => d.DeviceID)
        .filter((id): id is string => Boolean(id));

      await batchUpdateDeviceFields(deviceIds, updateData);

      toast.success(`成功更新 ${devices.length} 台设备`);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to batch update devices:', error);
      toast.error('批量更新失败');
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
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
              <IconEdit className='h-5 w-5' />
              批量编辑
            </DrawerTitle>
            <DrawerDescription>
              为选中的 {devices.length} 台设备批量修改字段（留空则不修改）
            </DrawerDescription>
          </DrawerHeader>

          <div className='space-y-6 p-4 pb-0'>
            {/* 机箱编号 */}
            <div className='space-y-2'>
              <Label htmlFor='cabinetID' className='flex items-center gap-2'>
                <IconServer className='h-4 w-4' />
                机箱编号
              </Label>
              <Input
                id='cabinetID'
                placeholder='输入机箱编号（留空则不修改）'
                value={cabinetID}
                onChange={(e) => setCabinetID(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* 卡槽编号 */}
            <div className='space-y-2'>
              <Label htmlFor='slotID' className='flex items-center gap-2'>
                <IconPlugConnected className='h-4 w-4' />
                卡槽编号
              </Label>
              <Input
                id='slotID'
                placeholder='输入卡槽编号（留空则不修改）'
                value={slotID}
                onChange={(e) => setSlotID(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* 备注 */}
            <div className='space-y-2'>
              <Label htmlFor='remark' className='flex items-center gap-2'>
                <IconNote className='h-4 w-4' />
                备注
              </Label>
              <Input
                id='remark'
                placeholder='输入备注信息（留空则不修改）'
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <Separator />

            {/* 提示信息 */}
            <div className='rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20'>
              <p className='text-xs text-blue-700 dark:text-blue-400'>
                <strong>提示：</strong>
                只有填写的字段才会被更新，留空的字段保持原值不变
              </p>
            </div>

            {/* 设备列表预览 */}
            <div className='space-y-2'>
              <h3 className='text-sm font-medium'>目标设备</h3>
              <div className='rounded-lg border bg-muted/50 p-3'>
                <p className='text-sm text-muted-foreground'>
                  已选择 <strong className='text-foreground'>{devices.length}</strong> 台设备
                </p>
                {devices.length > 0 && (
                  <div className='mt-2 space-y-1'>
                    {devices.slice(0, 3).map((device) => (
                      <p key={device.DeviceID} className='text-xs text-muted-foreground'>
                        • {device.DeviceName || device.DeviceID}
                      </p>
                    ))}
                    {devices.length > 3 && (
                      <p className='text-xs text-muted-foreground'>
                        ... 还有 {devices.length - 3} 台设备
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DrawerFooter className='flex-row gap-2'>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className='flex-1'
            >
              {isLoading ? '更新中...' : '确认更新'}
            </Button>
            <DrawerClose asChild>
              <Button
                variant='outline'
                className='flex-1'
                disabled={isLoading}
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
