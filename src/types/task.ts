/**
 * Task Management Types
 */

export type TaskColumn = 'todo' | 'inProgress' | 'review' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  column: TaskColumn;
  priority?: TaskPriority;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: TaskColumn;
  title: string;
  tasks: Task[];
}

export const COLUMN_CONFIG: Record<TaskColumn, { title: string; color: string }> = {
  todo: {
    title: 'To Do',
    color: '#3B82F6', // blue
  },
  inProgress: {
    title: 'In Progress',
    color: '#F59E0B', // amber
  },
  review: {
    title: 'Review',
    color: '#8B5CF6', // purple
  },
  completed: {
    title: 'Completed',
    color: '#10B981', // green
  },
};

export const PRIORITY_CONFIG: Record<TaskPriority, { color: string; label: string }> = {
  low: {
    color: '#6B7280',
    label: 'Low',
  },
  medium: {
    color: '#F59E0B',
    label: 'Medium',
  },
  high: {
    color: '#EF4444',
    label: 'High',
  },
};
