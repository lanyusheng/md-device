'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useGroupStore } from '../store/group.store';
import { toast } from 'sonner';

const formSchema = z.object({
  groupName: z
    .string()
    .min(1, { message: '分组名称不能为空' })
    .max(50, { message: '分组名称不能超过50个字符' })
});

type FormValues = z.infer<typeof formSchema>;

export function DeviceGroupDrawer() {
  const {
    isDrawerOpen,
    drawerMode,
    selectedGroup,
    closeDrawer,
    createGroup,
    updateGroup,
    isLoading
  } = useGroupStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      groupName: ''
    }
  });

  // 当选中分组变化时，更新表单
  useEffect(() => {
    if (selectedGroup && drawerMode === 'edit') {
      form.reset({
        groupName: selectedGroup.GroupName || ''
      });
    } else {
      form.reset({
        groupName: ''
      });
    }
  }, [selectedGroup, drawerMode, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (drawerMode === 'create') {
        await createGroup(values.groupName);
        toast.success('分组创建成功');
      } else if (drawerMode === 'edit' && selectedGroup?.GroupID) {
        await updateGroup(selectedGroup.GroupID, values.groupName);
        toast.success('分组更新成功');
      }
      form.reset();
    } catch (error) {
      toast.error(drawerMode === 'create' ? '分组创建失败' : '分组更新失败');
    }
  };

  const handleClose = () => {
    form.reset();
    closeDrawer();
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={handleClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            {drawerMode === 'create' ? '新建分组' : '编辑分组'}
          </SheetTitle>
          <SheetDescription>
            {drawerMode === 'create'
              ? '创建一个新的设备分组'
              : '修改分组信息'}
          </SheetDescription>
        </SheetHeader>

        <div className='mt-6'>
          <Form
            form={form}
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'
          >
            <FormField
              control={form.control}
              name='groupName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分组名称</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='请输入分组名称'
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex gap-2 justify-end'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
                disabled={isLoading}
              >
                取消
              </Button>
              <Button type='submit' disabled={isLoading}>
                {isLoading
                  ? '保存中...'
                  : drawerMode === 'create'
                    ? '创建'
                    : '保存'}
              </Button>
            </div>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
