'use client';

import { useEffect, useState } from 'react';
import { useGroupStore } from '../store/group.store';
import { useDeviceStore } from '../store/device.store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconFolderFilled,
  IconLayoutGrid,
  IconRefresh
} from '@tabler/icons-react';
import { DeviceGroup } from '@/types/api';
import { AlertModal } from '@/components/modal/alert-modal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function DeviceGroupPanel() {
  const {
    groups,
    fetchGroups,
    openDrawer,
    deleteGroup,
    isLoading
  } = useGroupStore();

  const { filterDevicesByGroup, selectedGroupId } = useDeviceStore();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<DeviceGroup | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleGroupClick = (group: DeviceGroup | null) => {
    filterDevicesByGroup(group?.GroupID || null);
  };

  const handleEdit = (group: DeviceGroup, e: React.MouseEvent) => {
    e.stopPropagation();
    openDrawer('edit', group);
  };

  const handleDeleteClick = (group: DeviceGroup, e: React.MouseEvent) => {
    e.stopPropagation();
    setGroupToDelete(group);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete?.GroupID) return;

    setDeleting(true);
    try {
      await deleteGroup(groupToDelete.GroupID);
      toast.success('分组已删除');
      setDeleteOpen(false);
      setGroupToDelete(null);
    } catch (error) {
      toast.error('删除失败');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card className='h-full flex flex-col'>
        <CardContent className='flex-1 overflow-hidden p-4'>
          <ScrollArea className='h-full'>
            <div className='space-y-2'>
              {/* 全部分组 */}
              <div
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors',
                  selectedGroupId === null
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
                onClick={() => handleGroupClick(null)}
              >
                <div className='flex items-center gap-2'>
                  <IconLayoutGrid className='h-4 w-4' />
                  <span className='font-medium'>全部分组 ({groups.length})</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchGroups();
                    }}
                    disabled={isLoading}
                    className='h-6 w-6'
                  >
                    <IconRefresh className='h-3 w-3' />
                  </Button>
                  <Button
                    size='icon'
                    variant='ghost'
                    onClick={(e) => {
                      e.stopPropagation();
                      openDrawer('create');
                    }}
                    className='h-6 w-6'
                  >
                    <IconPlus className='h-3 w-3' />
                  </Button>
                </div>
              </div>

              {/* 分组列表 */}
              {isLoading ? (
                <div className='text-center py-8 text-muted-foreground text-sm'>
                  加载中...
                </div>
              ) : groups.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground text-sm'>
                  暂无分组
                </div>
              ) : (
                groups.map((group) => (
                  <div
                    key={group.GroupID}
                    className={cn(
                      'flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors group',
                      selectedGroupId === group.GroupID
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    )}
                    onClick={() => handleGroupClick(group)}
                  >
                    <div className='flex items-center gap-2 flex-1 min-w-0'>
                      <IconFolderFilled className='h-4 w-4 flex-shrink-0' />
                      <span className='font-medium truncate'>
                        {group.GroupName}
                      </span>
                      {group.DeviceCount !== undefined && (
                        <span className='text-xs opacity-70'>
                          ({group.DeviceCount})
                        </span>
                      )}
                    </div>
                    <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6'
                        onClick={(e) => handleEdit(group, e)}
                      >
                        <IconEdit className='h-3 w-3' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-6 w-6'
                        onClick={(e) => handleDeleteClick(group, e)}
                      >
                        <IconTrash className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertModal
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setGroupToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title='确认删除'
        description={`确定要删除分组 "${groupToDelete?.GroupName}" 吗?此操作不会删除分组内的设备。`}
      />
    </>
  );
}
