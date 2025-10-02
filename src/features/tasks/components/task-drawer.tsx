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
import { Task, taskLabels, taskPriorities, taskStatuses } from '@/types/task';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
  title: z.string().min(3, {
    message: '任务标题至少需要 3 个字符'
  }),
  status: z.enum(['todo', 'in_progress', 'done', 'backlog', 'canceled']),
  label: z.enum(['bug', 'feature', 'documentation']),
  priority: z.enum(['low', 'medium', 'high'])
});

interface TaskDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: Task | null;
}

export function TaskDrawer({ open, onOpenChange, initialData }: TaskDrawerProps) {
  const defaultValues = {
    title: initialData?.title || '',
    status: initialData?.status || 'todo',
    label: initialData?.label || 'feature',
    priority: initialData?.priority || 'medium'
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues as z.infer<typeof formSchema>
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // TODO: 调用 API 创建或更新任务
      // if (initialData) {
      //   await fetch(`/api/tasks/${initialData.id}`, {
      //     method: 'PATCH',
      //     body: JSON.stringify(values)
      //   });
      // } else {
      //   await fetch('/api/tasks', {
      //     method: 'POST',
      //     body: JSON.stringify(values)
      //   });
      // }

      console.log(values);
      toast.success(initialData ? '任务已更新' : '任务已创建');
      onOpenChange(false);
      form.reset();
      router.refresh();
    } catch (error) {
      toast.error('操作失败，请重试');
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle>
            {initialData ? `编辑任务 - ${initialData.id}` : '创建新任务'}
          </SheetTitle>
          <SheetDescription>
            {initialData ? '更新任务信息' : '添加新任务到列表'}
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto py-4'>
          <Form
            form={form}
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-6'
          >
            <FormInput
              control={form.control}
              name='title'
              label='任务标题'
              placeholder='输入任务标题'
              required
            />

            <div className='grid grid-cols-1 gap-4'>
              <FormSelect
                control={form.control}
                name='status'
                label='状态'
                placeholder='选择状态'
                required
                options={taskStatuses.map((s) => ({
                  label: s.label,
                  value: s.value
                }))}
              />

              <FormSelect
                control={form.control}
                name='label'
                label='标签'
                placeholder='选择标签'
                required
                options={taskLabels.map((l) => ({
                  label: l.label,
                  value: l.value
                }))}
              />

              <FormSelect
                control={form.control}
                name='priority'
                label='优先级'
                placeholder='选择优先级'
                required
                options={taskPriorities.map((p) => ({
                  label: p.label,
                  value: p.value
                }))}
              />
            </div>

            <SheetFooter>
              <SheetClose asChild>
                <Button type='button' variant='outline'>
                  取消
                </Button>
              </SheetClose>
              <Button type='submit'>
                {initialData ? '更新任务' : '创建任务'}
              </Button>
            </SheetFooter>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
