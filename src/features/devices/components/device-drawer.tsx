'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Device } from '@/types/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useDeviceStore } from '../store/device.store';
import { useGroupStore } from '../store/group.store';
import { useEffect } from 'react';

const formSchema = z.object({
  DeviceName: z.string().min(1, { message: '设备名称不能为空' }),
  DeviceID: z.string().optional(),
  CpuCount: z.coerce.number().min(1, { message: 'CPU核心数至少为1' }),
  MemTotal: z.coerce.number().min(1, { message: '内存总量至少为1GB' }),
  PublicIP: z.string().optional(),
  DefaultIP: z.string().optional(),
  ServicePort: z.coerce
    .number()
    .min(1)
    .max(65535, { message: '端口范围1-65535' }),
  GroupID: z.coerce.number().default(0),
  CabinetID: z.string().optional(),
  SlotID: z.string().optional(),
  Remark: z.string().optional()
});

export function DeviceDrawer() {
  const {
    isDrawerOpen,
    drawerMode,
    selectedDevice,
    closeDrawer,
    createDevice,
    updateDevice,
    isLoading
  } = useDeviceStore();

  const { groups, fetchGroups } = useGroupStore();

  const isViewMode = drawerMode === 'view';
  const isEditMode = drawerMode === 'edit';

  // 加载分组列表
  useEffect(() => {
    if (isDrawerOpen) {
      fetchGroups();
    }
  }, [isDrawerOpen, fetchGroups]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      DeviceName: '',
      DeviceID: '',
      CpuCount: 4,
      MemTotal: 8,
      PublicIP: '',
      DefaultIP: '',
      ServicePort: 8080,
      GroupID: 0,
      CabinetID: '',
      SlotID: '',
      Remark: ''
    }
  });

  // 当选中设备或模式改变时，更新表单
  useEffect(() => {
    if (selectedDevice) {
      form.reset({
        DeviceName: selectedDevice.DeviceName || '',
        DeviceID: selectedDevice.DeviceID || '',
        CpuCount: selectedDevice.CpuCount || 4,
        MemTotal: selectedDevice.MemTotal || 8,
        PublicIP: selectedDevice.PublicIP || '',
        DefaultIP: selectedDevice.DefaultIP || '',
        ServicePort: selectedDevice.ServicePort || 8080,
        GroupID: selectedDevice.GroupID || 0,
        CabinetID: selectedDevice.CabinetID || '',
        SlotID: selectedDevice.SlotID || '',
        Remark: selectedDevice.Remark || ''
      });
    } else {
      form.reset({
        DeviceName: '',
        DeviceID: '',
        CpuCount: 4,
        MemTotal: 8,
        PublicIP: '',
        DefaultIP: '',
        ServicePort: 8080,
        GroupID: 0,
        CabinetID: '',
        SlotID: '',
        Remark: ''
      });
    }
  }, [selectedDevice, isDrawerOpen, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const deviceData: Device = {
        TenantID: selectedDevice?.TenantID || 0,
        DeviceID: values.DeviceID || null,
        DeviceName: values.DeviceName,
        CpuCount: values.CpuCount,
        CpuPercent: selectedDevice?.CpuPercent || 0,
        MemTotal: values.MemTotal,
        MemPercent: selectedDevice?.MemPercent || 0,
        BatteryPercent: selectedDevice?.BatteryPercent || 100,
        PublicIP: values.PublicIP || null,
        DefaultIP: values.DefaultIP || null,
        ServicePort: values.ServicePort,
        GroupID: values.GroupID,
        CabinetID: values.CabinetID || null,
        SlotID: values.SlotID || null,
        Remark: values.Remark || null,
        UpdateTime: new Date().toISOString()
      };

      if (isEditMode && selectedDevice?.DeviceID) {
        await updateDevice(selectedDevice.DeviceID, deviceData);
        toast.success('设备已更新');
      } else {
        await createDevice(deviceData);
        toast.success('设备已创建');
      }

      form.reset();
      closeDrawer();
    } catch (error) {
      toast.error('操作失败，请重试');
    }
  }

  const getTitle = () => {
    if (isViewMode) return `设备详情 - ${selectedDevice?.DeviceID}`;
    if (isEditMode) return `编辑设备 - ${selectedDevice?.DeviceID}`;
    return '创建新设备';
  };

  const getDescription = () => {
    if (isViewMode) return '查看设备详细信息';
    if (isEditMode) return '更新设备信息';
    return '添加新设备到列表';
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={closeDrawer}>
      <SheetContent side='right' className='overflow-y-auto px-6 sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle>{getTitle()}</SheetTitle>
          <SheetDescription>{getDescription()}</SheetDescription>
        </SheetHeader>

        <div className='flex-1 py-4'>
          <Form
            form={form}
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'
          >
            <FormInput
              control={form.control}
              name='DeviceName'
              label='设备名称'
              placeholder='输入设备名称'
              required
              disabled={isViewMode}
            />

            {isEditMode && (
              <FormInput
                control={form.control}
                name='DeviceID'
                label='设备ID'
                placeholder='设备ID（只读）'
                disabled={true}
              />
            )}

            <div className='grid grid-cols-2 gap-4'>
              <FormInput
                control={form.control}
                name='CpuCount'
                label='CPU核心数'
                type='number'
                placeholder='4'
                required
                disabled={isViewMode}
              />

              <FormInput
                control={form.control}
                name='MemTotal'
                label='内存总量(GB)'
                type='number'
                placeholder='8'
                required
                disabled={isViewMode}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormInput
                control={form.control}
                name='PublicIP'
                label='公网IP'
                placeholder='例如: 192.168.1.1'
                disabled={isViewMode}
              />

              <FormInput
                control={form.control}
                name='DefaultIP'
                label='内网IP'
                placeholder='例如: 10.0.0.1'
                disabled={isViewMode}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormInput
                control={form.control}
                name='ServicePort'
                label='服务端口'
                type='number'
                placeholder='8080'
                required
                disabled={isViewMode}
              />

              <FormSelect
                control={form.control}
                name='GroupID'
                label='设备分组'
                placeholder='选择分组'
                disabled={isViewMode}
                options={[
                  { label: '未分组', value: '0' },
                  ...groups.map((group) => ({
                    label: group.GroupName || '未命名分组',
                    value: String(group.GroupID)
                  }))
                ]}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <FormInput
                control={form.control}
                name='CabinetID'
                label='机箱编号'
                placeholder='输入机箱编号'
                disabled={isViewMode}
              />

              <FormInput
                control={form.control}
                name='SlotID'
                label='卡槽编号'
                placeholder='输入卡槽编号'
                disabled={isViewMode}
              />
            </div>

            <FormInput
              control={form.control}
              name='Remark'
              label='备注'
              placeholder='输入备注信息'
              disabled={isViewMode}
            />

            {!isViewMode && (
              <SheetFooter>
                <SheetClose asChild>
                  <Button type='button' variant='outline'>
                    取消
                  </Button>
                </SheetClose>
                <Button type='submit' disabled={isLoading}>
                  {isEditMode ? '更新设备' : '创建设备'}
                </Button>
              </SheetFooter>
            )}

            {isViewMode && (
              <SheetFooter>
                <SheetClose asChild>
                  <Button type='button' variant='outline'>
                    关闭
                  </Button>
                </SheetClose>
              </SheetFooter>
            )}
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
