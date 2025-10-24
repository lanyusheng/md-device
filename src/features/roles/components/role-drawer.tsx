'use client';

import { FormInput } from '@/components/forms/form-input';
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
import { Role, RoleFormValues } from '@/types/permission';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRoleStore } from '../store/role.store';

const formSchema = z.object({
  RoleName: z.string().min(2, { message: '角色名称至少2个字符' }).max(50, { message: '角色名称最多50个字符' }),
  Description: z.string().optional()
});

interface RoleDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: Role | null;
}

export function RoleDrawer({
  open,
  onOpenChange,
  initialData
}: RoleDrawerProps) {
  const { isDesktop } = useMediaQuery();
  const { addRole, updateRole } = useRoleStore();
  const router = useRouter();

  const defaultValues: RoleFormValues = {
    RoleName: initialData?.RoleName || '',
    Description: initialData?.Description || ''
  };

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  async function onSubmit(values: RoleFormValues) {
    try {
      if (initialData) {
        // 更新角色
        await updateRole({
          ...initialData,
          RoleName: values.RoleName,
          Description: values.Description
        });
      } else {
        // 创建角色
        await addRole({
          RoleName: values.RoleName,
          Description: values.Description
        });
      }

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
          className={isDesktop ? 'h-full overflow-auto' : 'mx-auto w-full max-w-2xl'}
        >
          <DrawerHeader>
            <DrawerTitle>
              {initialData ? `编辑角色 - ${initialData.RoleName}` : '创建角色'}
            </DrawerTitle>
            <DrawerDescription>
              {initialData ? '修改角色信息' : '添加新的角色'}
            </DrawerDescription>
          </DrawerHeader>

          <div className="p-4 pb-0">
            <Form
              form={form}
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormInput
                control={form.control}
                name="RoleName"
                label="角色名称"
                placeholder="请输入角色名称"
                required
              />

              <FormInput
                control={form.control}
                name="Description"
                label="描述"
                placeholder="请输入角色描述"
              />

              <DrawerFooter className="px-0">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? '提交中...'
                    : initialData
                      ? '更新角色'
                      : '创建角色'}
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
