'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Task, PRIORITY_CONFIG } from '@/types/task';
import { Trash2, GripVertical } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const priorityColor = task.priority ? PRIORITY_CONFIG[task.priority].color : '#6B7280';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 hover:shadow-md transition-shadow group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="font-medium text-gray-900 text-sm flex-1">{task.title}</h3>
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-opacity"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>

      {task.description && (
        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {task.priority && (
          <span
            className="px-2 py-0.5 rounded text-xs font-medium text-white"
            style={{ backgroundColor: priorityColor }}
          >
            {PRIORITY_CONFIG[task.priority].label}
          </span>
        )}

        {task.tags && task.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
