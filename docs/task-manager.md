# Task Manager Demo

The starter kit includes a complete **Trello-style task manager** as a real-world example of agentic UI. This isn't just a demo—it's a production-ready pattern you can extend for your own applications.

## Overview

The task manager demonstrates:
- **Natural language task creation** - "Add 3 tasks for the website redesign"
- **Intelligent organization** - AI assigns priorities and tags automatically
- **Visual kanban board** - Beautiful UI with smooth animations
- **Thread isolation** - Each conversation has its own task board
- **State persistence** - Tasks survive page refreshes

## Architecture

### Board Structure

4 columns representing a typical workflow:
- **To Do** - Tasks that haven't been started
- **In Progress** - Currently active work
- **Review** - Tasks awaiting review/approval
- **Completed** - Finished tasks

### Data Model

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  column: 'todo' | 'inProgress' | 'review' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
```

## Using the AI Agent

### Creating Tasks

**Single task:**
```
"Create a task to review the Q4 budget"
```

**Multiple tasks:**
```
"Add 3 tasks for the new website project:
1. Design mockups
2. Implement frontend
3. Deploy to production"
```

**With details:**
```
"Create a high priority task in Review column: 
'Security audit for payment system' 
tagged with security and urgent"
```

### Moving Tasks

**By name:**
```
"Move the design mockups task to In Progress"
```

**Bulk operations:**
```
"Move all high priority tasks to In Progress"
```

### Updating Tasks

```
"Update the budget review task to high priority"
"Add 'finance' tag to the budget task"
"Change the description of the security audit task"
```

### Deleting Tasks

```
"Delete the completed website tasks"
"Remove all tasks tagged with 'archive'"
```

## Agent Intelligence

The AI agent is smart about task management:

### Project Breakdown
Tell it about a project, and it breaks it down:
```
User: "I need to launch a new blog"

Agent creates:
✓ Research competitor blogs (To Do, high priority, tagged: research)
✓ Choose blog platform (To Do, medium priority, tagged: planning)
✓ Design blog theme (To Do, medium priority, tagged: design)
✓ Write first 3 posts (To Do, low priority, tagged: content)
```

### Priority Assignment
It understands urgency:
- "urgent" → high priority
- "when you have time" → low priority
- No mention → medium priority

### Smart Tagging
Automatically adds relevant tags based on context:
- "security audit" → [security, compliance]
- "blog post" → [content, writing]
- "database migration" → [backend, infrastructure]

## Code Structure

### Components

**`src/components/TaskBoard.tsx`**
- Main container
- Groups tasks by column
- Handles layout and scrolling

**`src/components/TaskColumn.tsx`**
- Individual column
- Header with count
- Vertical task list

**`src/components/TaskCard.tsx`**
- Single task display
- Priority badge
- Tags
- Delete button
- Framer Motion animations

### State Management

**Thread-scoped state:**
```typescript
const [tasks, setTasks] = useState<Task[]>([]);

// Automatically synced to current thread
// Each conversation has independent task list
```

**Persistence:**
```typescript
// Saved to localStorage
localStorage.setItem('agentic-web-thread-states', ...)

// Loaded on mount
// Survives page refresh
```

### Frontend Tools

The agent uses these tools (defined in `src/app/page.tsx`):

**`create-task`**
```typescript
{
  title: string,
  description?: string,
  column: TaskColumn,
  priority?: TaskPriority,
  tags?: string[]
}
```

**`update-task`**
```typescript
{
  taskId: string,
  title?: string,
  description?: string,
  priority?: TaskPriority,
  tags?: string[]
}
```

**`move-task`**
```typescript
{
  taskId: string,
  toColumn: TaskColumn
}
```

**`delete-task`**
```typescript
{
  taskId: string
}
```

### Backend Tools

Validation and LLM-facing tools in `src/backend/src/mastra/tools/taskTools.ts`:
- Schema validation with Zod
- Tool descriptions for the AI
- Type safety

## Extending the Demo

### Add Assignees

1. Update the Task interface:
```typescript
interface Task {
  // ... existing fields
  assignee?: {
    name: string;
    avatar?: string;
  };
}
```

2. Add to TaskCard:
```typescript
{task.assignee && (
  <div className="flex items-center gap-2">
    <img src={task.assignee.avatar} className="w-6 h-6 rounded-full" />
    <span>{task.assignee.name}</span>
  </div>
)}
```

3. Update the create-task tool schema

### Add Due Dates

```typescript
interface Task {
  // ... existing fields
  dueDate?: string;
}

// In TaskCard
{task.dueDate && (
  <div className="text-xs text-gray-500">
    Due: {new Date(task.dueDate).toLocaleDateString()}
  </div>
)}
```

### Add Drag & Drop

```typescript
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Wrap columns in DragDropContext
// Make TaskCard draggable
// Handle onDragEnd to update state
```

### Persist to Database

Replace localStorage with Supabase:

```typescript
// Use the storage adapters from src/lib/storage/
import { SupabaseChatAdapter } from '@/lib/storage/supabase';

// Store tasks alongside conversation data
// See docs/chat-history.md for setup
```

## Best Practices

### 1. Clear Task Titles
The AI works best with specific, actionable titles:
- ✅ "Review Q4 budget report"
- ❌ "Budget stuff"

### 2. Use Tags Consistently
Create a taxonomy:
- Work type: design, development, review, planning
- Priority: urgent, blocked, waiting
- Category: frontend, backend, ops, content

### 3. Leverage Thread Isolation
Create different boards for different projects:
- Thread 1: "Website Redesign" tasks
- Thread 2: "Q4 Planning" tasks
- Thread 3: "Bug Fixes" tasks

### 4. Descriptive Prompts
Give context for better organization:
```
"Create tasks for launching the mobile app:
- Need designs by Friday (high priority)
- Backend can wait (low priority)
- Testing is critical (high priority)"
```

## Performance Considerations

- **Framer Motion** - Uses layout animations for smooth column reflows
- **Memoization** - TasksByColumn computed with useMemo
- **Keys** - Proper React keys for efficient re-renders
- **LocalStorage** - Throttle saves if you have 1000+ tasks

## What Makes This Different from Cedar Template?

1. **Real application** - Not a "change text" demo
2. **Complex state** - Shows proper state management patterns
3. **Visual design** - Production-quality UI
4. **Smart agent** - Demonstrates AI capabilities beyond chat
5. **Extensible** - Clear path to add features

This is a **foundation you can build on**, not just a tutorial.

## Next Steps

- Customize the board columns for your workflow
- Add your own task metadata (assignees, dates, etc.)
- Connect to your project management tools
- Build specialized agents for different task types
- Scale to team collaboration with real-time updates

The code is designed to be modified. Fork it, extend it, make it yours! 🚀
