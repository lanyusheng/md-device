'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { useGroupStore } from '../store/group.store';
import { useDeviceStore } from '../store/device.store';
import { toast } from 'sonner';
import { Device } from '@/types/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/use-media-query';
import { IconCheck, IconFolders, IconSearch } from '@tabler/icons-react';

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
  const { isDesktop } = useMediaQuery();
  const { groups, fetchGroups, isLoading: isGroupLoading } = useGroupStore();
  const { batchAssignDevicesToGroup, isLoading: isDeviceLoading } = useDeviceStore();
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (open) {
      fetchGroups();
      setSelectedGroupId(null);
      setSearchQuery('');
    }
  }, [open, fetchGroups]);

  // 根据搜索关键词过滤分组
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) {
      return groups;
    }
    const query = searchQuery.toLowerCase();
    return groups.filter((group) =>
      group.GroupName?.toLowerCase().includes(query)
    );
  }, [groups, searchQuery]);

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
              <IconFolders className='h-5 w-5' />
              批量分组
            </DrawerTitle>
            <DrawerDescription>
              为选中的 {devices.length} 台设备分配分组
            </DrawerDescription>
          </DrawerHeader>

          <div className='space-y-6 p-4 pb-0'>
            {/* 搜索分组 */}
            <div className='space-y-2'>
              <h3 className='text-sm font-medium'>搜索分组</h3>
              <div className='relative'>
                <IconSearch className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='输入分组名称搜索...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isLoading}
                  className='pl-9'
                />
              </div>
            </div>

            <Separator />

            {/* 分组列表 */}
            <div className='flex flex-1 flex-col space-y-2'>
              <div className='flex items-center justify-between'>
                <h3 className='text-sm font-medium'>选择分组</h3>
                <span className='text-muted-foreground text-xs'>
                  {filteredGroups.length > 0
                    ? `共 ${filteredGroups.length} 个分组`
                    : '暂无分组'}
                </span>
              </div>

              <ScrollArea className='flex-1 rounded-lg border' style={{ height: '300px' }}>
                <div className='space-y-1 p-2'>
                  {filteredGroups.length === 0 ? (
                    <div className='flex h-[280px] flex-col items-center justify-center text-center text-sm text-muted-foreground'>
                      {groups.length === 0 ? (
                        <>
                          <p>暂无分组</p>
                          <p className='mt-1'>请先创建分组</p>
                        </>
                      ) : (
                        <>
                          <p>未找到匹配的分组</p>
                          <p className='mt-1'>请尝试其他关键词</p>
                        </>
                      )}
                    </div>
                  ) : (
                    filteredGroups.map((group) => (
                      <button
                        key={group.GroupID}
                        onClick={() => setSelectedGroupId(group.GroupID ?? null)}
                        disabled={isLoading}
                        className={`
                          flex w-full items-center justify-between rounded-md border p-3 text-left transition-colors
                          ${
                            selectedGroupId === group.GroupID
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-card hover:bg-accent/50'
                          }
                          ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                        `}
                      >
                        <div className='min-w-0 flex-1'>
                          <div className='truncate font-medium'>
                            {group.GroupName}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            ID: {group.GroupID}
                          </div>
                        </div>
                        {selectedGroupId === group.GroupID && (
                          <IconCheck className='ml-2 h-5 w-5 flex-shrink-0 text-primary' />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* 分配提示 */}
            {selectedGroupId && devices.length > 0 && (
              <div className='rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20'>
                <p className='text-xs text-blue-700 dark:text-blue-400'>
                  <strong>提示：</strong>
                  点击&quot;确认分配&quot;后，将为选中的 {devices.length} 台设备分配到{' '}
                  <strong>
                    {filteredGroups.find((g) => g.GroupID === selectedGroupId)?.GroupName}
                  </strong>{' '}
                  分组
                </p>
              </div>
            )}
          </div>

          <DrawerFooter className='flex-row gap-2'>
            <Button
              onClick={handleAssign}
              disabled={isLoading || !selectedGroupId}
              className='flex-1'
            >
              {isLoading ? '分配中...' : '确认分配'}
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
