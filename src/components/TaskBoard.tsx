'use client';

import React from 'react';
import { Task, TaskColumn as TaskColumnType } from '@/types/task';
import { TaskColumn } from './TaskColumn';

interface TaskBoardProps {
  tasks: Task[];
  onDeleteTask: (taskId: string) => void;
}

export function TaskBoard({ tasks, onDeleteTask }: TaskBoardProps) {
  // Group tasks by column
  const tasksByColumn = React.useMemo(() => {
    const grouped: Record<TaskColumnType, Task[]> = {
      todo: [],
      inProgress: [],
      review: [],
      completed: [],
    };

    tasks.forEach((task) => {
      grouped[task.column].push(task);
    });

    // Sort by creation date (newest first) within each column
    Object.keys(grouped).forEach((column) => {
      grouped[column as TaskColumnType].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return grouped;
  }, [tasks]);

  return (
    <div className="flex-1 overflow-x-auto">
      <div className="flex gap-4 p-6 h-full min-w-max">
        <TaskColumn
          column="todo"
          tasks={tasksByColumn.todo}
          onDelete={onDeleteTask}
        />
        <TaskColumn
          column="inProgress"
          tasks={tasksByColumn.inProgress}
          onDelete={onDeleteTask}
        />
        <TaskColumn
          column="review"
          tasks={tasksByColumn.review}
          onDelete={onDeleteTask}
        />
        <TaskColumn
          column="completed"
          tasks={tasksByColumn.completed}
          onDelete={onDeleteTask}
        />
      </div>
    </div>
  );
}
