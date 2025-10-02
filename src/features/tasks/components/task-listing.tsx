'use client';

import { mockTasks } from '@/constants/task-data';
import { TaskTable } from './task-tables';
import { columns } from './task-tables/columns';

export default function TaskListingPage() {
  // TODO: 从 API 获取数据，支持分页和筛选
  // 使用 SWR 或 React Query 进行数据获取
  // const { data } = useSWR('/api/tasks', fetcher);

  // 使用 Mock 数据
  const tasks = mockTasks;
  const totalTasks = mockTasks.length;

  return (
    <TaskTable
      data={tasks}
      totalItems={totalTasks}
      columns={columns}
    />
  );
}
