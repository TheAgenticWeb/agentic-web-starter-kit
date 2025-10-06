'use client';

import React from 'react';
import { z } from 'zod';
import {
  useRegisterState,
  useRegisterFrontendTool,
  useSubscribeStateToAgentContext,
  useThreadController,
} from 'cedar-os';

import { ChatModeSelector } from '@/components/ChatModeSelector';
import { ConversationSidebar } from '@/components/ConversationSidebar';
import { TaskBoard } from '@/components/TaskBoard';
import { CedarCaptionChat } from '@/cedar/components/chatComponents/CedarCaptionChat';
import { FloatingCedarChat } from '@/cedar/components/chatComponents/FloatingCedarChat';
import { SidePanelCedarChat } from '@/cedar/components/chatComponents/SidePanelCedarChat';
import { DebuggerPanel } from '@/cedar/components/debugger';
import { Task, TaskColumn, TaskPriority } from '@/types/task';

type ChatMode = 'floating' | 'sidepanel' | 'caption';

// Thread-scoped state storage
interface ThreadState {
  tasks: Task[];
}

export default function HomePage() {
  // Get current thread from Cedar
  const { currentThreadId } = useThreadController();

  // Chat mode selector - choose between caption, floating, or side panel
  const [chatMode, setChatMode] = React.useState<ChatMode>('sidepanel');

  // Store state per thread - use ref to avoid circular updates
  const threadStatesRef = React.useRef<Record<string, ThreadState>>({});
  const previousThreadIdRef = React.useRef<string>(currentThreadId);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Load thread states from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('agentic-web-thread-states');
      if (saved) {
        const parsed = JSON.parse(saved);
        threadStatesRef.current = parsed;
        
        // Load current thread's state if it exists
        const currentState = parsed[currentThreadId];
        if (currentState) {
          setTasks(currentState.tasks || []);
        }
      }
    } catch (error) {
      console.error('Failed to load thread states:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // State for tasks (thread-scoped)
  const [tasks, setTasks] = React.useState<Task[]>([]);

  // Handle thread switching and persistence
  React.useEffect(() => {
    if (!isLoaded) return; // Don't run until initial load is complete

    const previousThreadId = previousThreadIdRef.current;
    
    // If thread changed, save previous thread's state and load new thread's state
    if (previousThreadId !== currentThreadId) {
      // Save previous thread's state
      threadStatesRef.current[previousThreadId] = { tasks };
      
      // Load new thread's state (or use defaults)
      const newThreadState = threadStatesRef.current[currentThreadId];
      if (newThreadState) {
        setTasks(newThreadState.tasks || []);
      } else {
        // New thread - reset to empty task list
        setTasks([]);
      }
      
      // Update ref
      previousThreadIdRef.current = currentThreadId;
    } else {
      // Same thread - just keep the ref updated with current state
      threadStatesRef.current[currentThreadId] = { tasks };
    }

    // Persist to localStorage
    try {
      localStorage.setItem(
        'agentic-web-thread-states',
        JSON.stringify(threadStatesRef.current)
      );
    } catch (error) {
      console.error('Failed to save thread states:', error);
    }
  }, [currentThreadId, tasks, isLoaded]);

  // Register tasks as state (thread-scoped)
  useRegisterState({
    key: 'tasks',
    description: `All tasks in the current board. This state is scoped to thread ${currentThreadId}.`,
    value: tasks,
    setValue: setTasks,
  });

  // Subscribe tasks state to the backend
  useSubscribeStateToAgentContext(
    'tasks',
    (tasks: Task[]) => ({
      'current-tasks': tasks.map((t: Task) => ({
        id: t.id,
        title: t.title,
        column: t.column,
        priority: t.priority,
        tags: t.tags,
      })),
    }),
    {
      showInChat: true,
      color: '#3B82F6',
    }
  );

  // Frontend tool: Create Task
  useRegisterFrontendTool({
    name: 'create-task',
    description: 'Create a new task in a specific column',
    argsSchema: z.object({
      title: z.string().describe('The task title'),
      description: z.string().optional().describe('Optional task description'),
      column: z.enum(['todo', 'inProgress', 'review', 'completed']).describe('Which column to add the task to'),
      priority: z.enum(['low', 'medium', 'high']).optional().describe('Task priority level'),
      tags: z.array(z.string()).optional().describe('Tags for categorizing the task'),
    }),
    execute: async (args: {
      title: string;
      description?: string;
      column: TaskColumn;
      priority?: TaskPriority;
      tags?: string[];
    }) => {
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: args.title,
        description: args.description,
        column: args.column,
        priority: args.priority,
        tags: args.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks((prev) => [...prev, newTask]);
    },
  });

  // Frontend tool: Update Task
  useRegisterFrontendTool({
    name: 'update-task',
    description: 'Update an existing task',
    argsSchema: z.object({
      taskId: z.string().describe('The ID of the task to update'),
      title: z.string().optional().describe('New task title'),
      description: z.string().optional().describe('New task description'),
      priority: z.enum(['low', 'medium', 'high']).optional().describe('New priority level'),
      tags: z.array(z.string()).optional().describe('New tags'),
    }),
    execute: async (args: {
      taskId: string;
      title?: string;
      description?: string;
      priority?: TaskPriority;
      tags?: string[];
    }) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === args.taskId
            ? {
                ...task,
                title: args.title ?? task.title,
                description: args.description ?? task.description,
                priority: args.priority ?? task.priority,
                tags: args.tags ?? task.tags,
                updatedAt: new Date().toISOString(),
              }
            : task
        )
      );
    },
  });

  // Frontend tool: Move Task
  useRegisterFrontendTool({
    name: 'move-task',
    description: 'Move a task from one column to another',
    argsSchema: z.object({
      taskId: z.string().describe('The ID of the task to move'),
      toColumn: z.enum(['todo', 'inProgress', 'review', 'completed']).describe('Destination column'),
    }),
    execute: async (args: { taskId: string; toColumn: TaskColumn }) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === args.taskId
            ? { ...task, column: args.toColumn, updatedAt: new Date().toISOString() }
            : task
        )
      );
    },
  });

  // Frontend tool: Delete Task
  useRegisterFrontendTool({
    name: 'delete-task',
    description: 'Delete a task from the board',
    argsSchema: z.object({
      taskId: z.string().describe('The ID of the task to delete'),
    }),
    execute: async (args: { taskId: string }) => {
      setTasks((prev) => prev.filter((task) => task.id !== args.taskId));
    },
  });

  // Delete task handler
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const renderContent = () => (
    <div className="relative h-screen w-full flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agentic Task Manager</h1>
          <p className="text-sm text-gray-600 mt-1">
            Chat with AI to create and manage tasks • {tasks.length} total tasks
          </p>
        </div>
        <ChatModeSelector currentMode={chatMode} onModeChange={setChatMode} />
      </div>

      {/* Task Board */}
      <TaskBoard tasks={tasks} onDeleteTask={handleDeleteTask} />

      {/* Chat Components */}
      {chatMode === 'caption' && <CedarCaptionChat />}
      {chatMode === 'floating' && (
        <FloatingCedarChat side="right" title="Task Assistant" collapsedLabel="Chat" />
      )}
    </div>
  );

  if (chatMode === 'sidepanel') {
    return (
      <div className="flex h-screen">
        <ConversationSidebar />
        <div className="flex-1">
          <SidePanelCedarChat
            side="right"
            title="Task Assistant"
            collapsedLabel="Chat"
            showCollapsedButton={true}
          >
            <DebuggerPanel />
            {renderContent()}
          </SidePanelCedarChat>
        </div>
      </div>
    );
  }

  return renderContent();
}
