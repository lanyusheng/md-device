'use client';

import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useGroupStore } from '../store/group.store';
import { useDeviceStore } from '../store/device.store';
import { toast } from 'sonner';
import { Device } from '@/types/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IconCheck } from '@tabler/icons-react';

interface BatchAssignGroupDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  devices: Device[];
}

export function BatchAssignGroupDrawer({
  open,
  onOpenChange,
  devices
}: BatchAssignGroupDrawerProps) {
  const { groups, fetchGroups, isLoading: isGroupLoading } = useGroupStore();
  const { batchAssignDevicesToGroup, isLoading: isDeviceLoading } = useDeviceStore();
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      fetchGroups();
      setSelectedGroupId(null);
    }
  }, [open, fetchGroups]);

  const handleAssign = async () => {
    if (!selectedGroupId) {
      toast.error('请选择一个分组');
      return;
    }

    if (devices.length === 0) {
      toast.error('没有选中的设备');
      return;
    }

    try {
      await batchAssignDevicesToGroup(
        devices.map((d) => d.DeviceID).filter((id): id is string => Boolean(id)),
        selectedGroupId
      );
      toast.success(`成功将 ${devices.length} 个设备分配到分组`);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to assign devices to group:', error);
      toast.error('批量分组失败');
    }
  };

  const isLoading = isGroupLoading || isDeviceLoading;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>批量分组</SheetTitle>
          <SheetDescription>
            为选中的 {devices.length} 个设备分配分组
          </SheetDescription>
        </SheetHeader>

        <div className='mt-6 space-y-4'>
          <div>
            <h4 className='mb-3 text-sm font-medium'>选择分组</h4>
            <ScrollArea className='h-[400px] pr-4'>
              <div className='space-y-2'>
                {groups.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground'>
                    <p>暂无分组</p>
                    <p className='mt-1'>请先创建分组</p>
                  </div>
                ) : (
                  groups.map((group) => (
                    <button
                      key={group.GroupID}
                      onClick={() => setSelectedGroupId(group.GroupID ?? null)}
                      disabled={isLoading}
                      className={`
                        flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors
                        ${
                          selectedGroupId === group.GroupID
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:bg-accent'
                        }
                        ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                      `}
                    >
                      <div>
                        <div className='font-medium'>{group.GroupName}</div>
                        <div className='text-xs text-muted-foreground'>
                          ID: {group.GroupID}
                        </div>
                      </div>
                      {selectedGroupId === group.GroupID && (
                        <IconCheck className='h-5 w-5 text-primary' />
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <div className='flex gap-2 justify-end pt-4 border-t'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button
              onClick={handleAssign}
              disabled={isLoading || !selectedGroupId}
            >
              {isLoading ? '分配中...' : '确认分配'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
