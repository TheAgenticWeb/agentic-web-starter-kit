'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, TaskColumn as TaskColumnType, COLUMN_CONFIG } from '@/types/task';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

interface TaskColumnProps {
  column: TaskColumnType;
  tasks: Task[];
  onDelete: (taskId: string) => void;
}

export function TaskColumn({ column, tasks, onDelete }: TaskColumnProps) {
  const config = COLUMN_CONFIG[column];

  return (
    <div className="flex-1 min-w-[280px] max-w-[320px]">
      <div className="bg-gray-50 rounded-lg p-4 h-full flex flex-col">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            <h2 className="font-semibold text-gray-900">{config.title}</h2>
            <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
              {tasks.length}
            </span>
          </div>
          <button
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Add task"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Tasks */}
        <div className="flex-1 overflow-y-auto space-y-2">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No tasks yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
