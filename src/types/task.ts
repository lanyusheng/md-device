export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'backlog' | 'canceled';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskLabel = 'bug' | 'feature' | 'documentation';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  label: TaskLabel;
  priority: TaskPriority;
  createdAt: string;
  updatedAt?: string;
}

export const taskStatuses: { label: string; value: TaskStatus }[] = [
  { label: 'Todo', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
  { label: 'Backlog', value: 'backlog' },
  { label: 'Canceled', value: 'canceled' }
];

export const taskPriorities: { label: string; value: TaskPriority }[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' }
];

export const taskLabels: { label: string; value: TaskLabel }[] = [
  { label: 'Bug', value: 'bug' },
  { label: 'Feature', value: 'feature' },
  { label: 'Documentation', value: 'documentation' }
];
