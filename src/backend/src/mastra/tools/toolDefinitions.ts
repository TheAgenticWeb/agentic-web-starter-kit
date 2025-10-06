import {
  createMastraToolForFrontendTool,
  createMastraToolForStateSetter,
  createRequestAdditionalContextTool,
} from '@cedar-os/backend';
import { streamJSONEvent } from '../../utils/streamUtils';
import { z } from 'zod';
import { webSearchTool } from './webSearchTool';

// Define the schemas for our tools based on what we registered in page.tsx

// Task Management Tool Schemas
export const CreateTaskSchema = z.object({
  title: z.string().describe('The task title'),
  description: z.string().optional().describe('Optional task description'),
  column: z.enum(['todo', 'inProgress', 'review', 'completed']).describe('Which column to add the task to'),
  priority: z.enum(['low', 'medium', 'high']).optional().describe('Task priority level'),
  tags: z.array(z.string()).optional().describe('Tags for categorizing the task'),
});

export const UpdateTaskSchema = z.object({
  taskId: z.string().describe('The ID of the task to update'),
  title: z.string().optional().describe('New task title'),
  description: z.string().optional().describe('New task description'),
  priority: z.enum(['low', 'medium', 'high']).optional().describe('New priority level'),
  tags: z.array(z.string()).optional().describe('New tags'),
});

export const MoveTaskSchema = z.object({
  taskId: z.string().describe('The ID of the task to move'),
  toColumn: z.enum(['todo', 'inProgress', 'review', 'completed']).describe('Destination column'),
});

export const DeleteTaskSchema = z.object({
  taskId: z.string().describe('The ID of the task to delete'),
});

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
});

// Create backend tools for task management frontend tools
export const createTaskTool = createMastraToolForFrontendTool(
  'create-task',
  CreateTaskSchema,
  {
    description:
      'Create a new task in the specified column with optional priority and tags. Use this to add tasks to the kanban board.',
    toolId: 'create-task',
    streamEventFn: streamJSONEvent,
    errorSchema: ErrorResponseSchema,
  },
);

export const updateTaskTool = createMastraToolForFrontendTool(
  'update-task',
  UpdateTaskSchema,
  {
    description:
      'Update an existing task\'s title, description, priority, or tags. Use the taskId to identify which task to update.',
    toolId: 'update-task',
    streamEventFn: streamJSONEvent,
    errorSchema: ErrorResponseSchema,
  },
);

export const moveTaskTool = createMastraToolForFrontendTool(
  'move-task',
  MoveTaskSchema,
  {
    description:
      'Move a task from one column to another. Use this to progress tasks through the workflow (To Do → In Progress → Review → Completed).',
    toolId: 'move-task',
    streamEventFn: streamJSONEvent,
    errorSchema: ErrorResponseSchema,
  },
);

export const deleteTaskTool = createMastraToolForFrontendTool(
  'delete-task',
  DeleteTaskSchema,
  {
    description:
      'Delete a task from the board permanently. Use the taskId to identify which task to remove.',
    toolId: 'delete-task',
    streamEventFn: streamJSONEvent,
    errorSchema: ErrorResponseSchema,
  },
);

export const requestAdditionalContextTool = createRequestAdditionalContextTool();

/**
 * Registry of all available tools organized by category
 * This structure makes it easy to see tool organization and generate categorized descriptions
 */
export const TOOL_REGISTRY = {
  taskManagement: {
    createTaskTool,
    updateTaskTool,
    moveTaskTool,
    deleteTaskTool,
  },
  webSearch: {
    webSearchTool,
  },
};

// Export all tools as an array for easy registration
export const ALL_TOOLS = [
  createTaskTool,
  updateTaskTool,
  moveTaskTool,
  deleteTaskTool,
  webSearchTool,
];
