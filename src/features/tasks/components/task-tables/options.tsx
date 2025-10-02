import { taskLabels, taskPriorities, taskStatuses } from '@/types/task';
import {
  IconAlertCircle,
  IconArrowDown,
  IconArrowUp,
  IconArrowUpRight,
  IconCircle,
  IconCircleCheck,
  IconCircleDashed,
  IconCircleMinus,
  IconCircleX,
  IconFileText
} from '@tabler/icons-react';

export const statuses = taskStatuses.map((status) => {
  const iconMap = {
    todo: IconCircle,
    in_progress: IconCircleDashed,
    done: IconCircleCheck,
    backlog: IconCircleMinus,
    canceled: IconCircleX
  };

  return {
    value: status.value,
    label: status.label,
    icon: iconMap[status.value]
  };
});

export const priorities = taskPriorities.map((priority) => {
  const iconMap = {
    low: IconArrowDown,
    medium: IconArrowUpRight,
    high: IconArrowUp
  };

  return {
    value: priority.value,
    label: priority.label,
    icon: iconMap[priority.value]
  };
});

export const labels = taskLabels.map((label) => {
  const iconMap = {
    bug: IconAlertCircle,
    feature: IconCircle,
    documentation: IconFileText
  };

  return {
    value: label.value,
    label: label.label,
    icon: iconMap[label.value]
  };
});
