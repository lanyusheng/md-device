'use client';

import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Device } from '@/types/api';
import { useDeviceStore } from '../../store/device.store';
import {
  IconCopy,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye,
  IconPlayerPlay,
  IconPlayerStop,
} from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CellActionProps {
  data: Device;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { deleteDevice, openDrawer } = useDeviceStore();

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
          <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
            <IconTrash className='mr-2 h-4 w-4' /> 删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
