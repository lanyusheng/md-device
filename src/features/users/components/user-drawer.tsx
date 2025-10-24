'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { LocationUserFormValues } from '@/types/permission';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useUserStore } from '../store/user.store';
import { useRoleStore } from '@/features/roles/store/role.store';
import { useEffect } from 'react';

const formSchema = z.object({
  UserName: z
    .string()
    .min(2, { message: '用户名至少2个字符' })
    .max(50, { message: '用户名最多50个字符' }),
  MobilePhone: z
    .string()
    .regex(/^1[3-9]\d{9}$/, { message: '请输入有效的手机号' }),
  RoleID: z.number().min(1, { message: '请选择角色' }),
  Password: z
    .string()
    .min(6, { message: '密码至少6个字符' })
    .max(20, { message: '密码最多20个字符' })
    .optional()
});

interface UserDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDrawer({ open, onOpenChange }: UserDrawerProps) {
  const { isDesktop } = useMediaQuery();
  const { addUser } = useUserStore();
  const { roles, fetchRoles } = useRoleStore();
  const router = useRouter();

  useEffect(() => {
    if (open && roles.length === 0) {
      fetchRoles();
    }
  }, [open, roles.length, fetchRoles]);

  const defaultValues: LocationUserFormValues = {
    UserName: '',
    MobilePhone: '',
    RoleID: 0,
    Password: ''
  };

  const form = useForm<LocationUserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  async function onSubmit(values: LocationUserFormValues) {
    try {
      await addUser({
        UserName: values.UserName,
        MobilePhone: values.MobilePhone,
        RoleID: values.RoleID,
        Password: values.Password
      });

      onOpenChange(false);
      form.reset();
      router.refresh();
    } catch (error) {
      // Error handled in store
    }
  }

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
            <DrawerTitle>添加操作员</DrawerTitle>
            <DrawerDescription>添加新的操作员并分配角色</DrawerDescription>
          </DrawerHeader>

          <div className="p-4 pb-0">
            <Form
              form={form}
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormInput
                control={form.control}
                name="UserName"
                label="用户名"
                placeholder="请输入用户名"
                required
              />

              <FormInput
                control={form.control}
                name="MobilePhone"
                label="手机号"
                placeholder="请输入手机号"
                required
              />

              <FormInput
                control={form.control}
                name="Password"
                label="密码"
                type="password"
                placeholder="请输入初始密码"
              />

              <FormSelect
                control={form.control}
                name="RoleID"
                label="角色"
                placeholder="请选择角色"
                required
                options={roles.map((role) => ({
                  label: role.RoleName,
                  value: role.RoleID.toString()
                }))}
              />

              <DrawerFooter className="px-0">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? '提交中...' : '添加操作员'}
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">取消</Button>
                </DrawerClose>
              </DrawerFooter>
            </Form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
