'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import TaskListingPage from '@/features/tasks/components/task-listing';
import { TaskDrawer } from '@/features/tasks/components/task-drawer';
import { IconPlus } from '@tabler/icons-react';
import { useState } from 'react';

export default function Page() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Tasks'
            description="Here's a list of your tasks for this month!"
          />
          <Button
            onClick={() => setDrawerOpen(true)}
            className='text-xs md:text-sm'
          >
            <IconPlus className='mr-2 h-4 w-4' /> Create Task
          </Button>
        </div>
        <Separator />
        <TaskListingPage />
      </div>

      <TaskDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        initialData={null}
      />
    </PageContainer>
  );
}
