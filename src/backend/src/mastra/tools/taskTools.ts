import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Task Management Tools for Trello-style Board
 * 
 * These tools allow the agent to manage tasks across different columns
 */

export const createTaskTool = createTool({
  id: 'create-task',
  description: 'Create a new task in a specific column',
  inputSchema: z.object({
    title: z.string().describe('The task title'),
    description: z.string().optional().describe('Optional task description'),
    column: z.enum(['todo', 'inProgress', 'review', 'completed']).describe('Which column to add the task to'),
    priority: z.enum(['low', 'medium', 'high']).optional().describe('Task priority level'),
    tags: z.array(z.string()).optional().describe('Tags for categorizing the task'),
  }),
  outputSchema: z.object({
    taskId: z.string(),
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    // This will be handled by the frontend tool
    // Backend just validates and returns a placeholder
    return {
      taskId: `task-${Date.now()}`,
      success: true,
      message: `Task "${context.title}" will be created in ${context.column}`,
    };
  },
});

export const updateTaskTool = createTool({
  id: 'update-task',
  description: 'Update an existing task (title, description, priority, tags)',
  inputSchema: z.object({
    taskId: z.string().describe('The ID of the task to update'),
    title: z.string().optional().describe('New task title'),
    description: z.string().optional().describe('New task description'),
    priority: z.enum(['low', 'medium', 'high']).optional().describe('New priority level'),
    tags: z.array(z.string()).optional().describe('New tags'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    return {
      success: true,
      message: `Task ${context.taskId} will be updated`,
    };
  },
});

export const moveTaskTool = createTool({
  id: 'move-task',
  description: 'Move a task from one column to another',
  inputSchema: z.object({
    taskId: z.string().describe('The ID of the task to move'),
    fromColumn: z.enum(['todo', 'inProgress', 'review', 'completed']).describe('Current column'),
    toColumn: z.enum(['todo', 'inProgress', 'review', 'completed']).describe('Destination column'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    return {
      success: true,
      message: `Task ${context.taskId} will be moved from ${context.fromColumn} to ${context.toColumn}`,
    };
  },
});

export const deleteTaskTool = createTool({
  id: 'delete-task',
  description: 'Delete a task from the board',
  inputSchema: z.object({
    taskId: z.string().describe('The ID of the task to delete'),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    return {
      success: true,
      message: `Task ${context.taskId} will be deleted`,
    };
  },
});

export const listTasksTool = createTool({
  id: 'list-tasks',
  description: 'List all tasks, optionally filtered by column or tag',
  inputSchema: z.object({
    column: z.enum(['todo', 'inProgress', 'review', 'completed']).optional().describe('Filter by column'),
    tag: z.string().optional().describe('Filter by tag'),
  }),
  outputSchema: z.object({
    tasks: z.array(z.object({
      id: z.string(),
      title: z.string(),
      column: z.string(),
      priority: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })),
    message: z.string(),
  }),
  execute: async ({ context }) => {
    return {
      tasks: [],
      message: 'Task list will be retrieved from frontend state',
    };
  },
});
