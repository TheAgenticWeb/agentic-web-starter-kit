# Architecture Overview

Understanding the architecture of the Agentic Web Starter Kit.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │  Cedar-OS  │  │   React UI   │  │  State Management │   │
│  │ Components │  │  Components  │  │   (Chat History)  │   │
│  └────────────┘  └──────────────┘  └───────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTP/SSE
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    Backend (Mastra)                          │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │   Agents   │  │   Workflows  │  │      Tools        │   │
│  │  (OpenAI)  │  │   (Chains)   │  │  (Actions/APIs)   │   │
│  └────────────┘  └──────────────┘  └───────────────────┘   │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │   Memory   │  │   Storage    │  │   API Routes      │   │
│  │ (Threads)  │  │   (LibSQL)   │  │   (Endpoints)     │   │
│  └────────────┘  └──────────────┘  └───────────────────┘   │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            │ External APIs
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    External Services                         │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │   OpenAI   │  │   Exa.ai     │  │     Auth0         │   │
│  │    API     │  │ (Web Search) │  │  (Auth for AI)    │   │
│  └────────────┘  └──────────────┘  └───────────────────┘   │
│  ┌────────────┐                                             │
│  │  Supabase  │  (Optional - Production Storage)            │
│  └────────────┘                                             │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Cedar-OS Components
The UI layer uses Cedar-OS components for a beautiful, modern chat interface:

- **Chat Modes**: Floating, side panel, and caption modes
- **State Management**: React hooks for agent state
- **Frontend Tools**: Client-side tools that agents can trigger
- **State Setters**: Allow agents to modify UI state

### Key Frontend Files
```
src/app/page.tsx                 # Main app component
src/components/ChatModeSelector  # UI mode switcher
src/cedar/                       # Cedar-OS components
src/lib/                         # Hooks and utilities
```

## Backend Architecture

### Mastra Framework
The backend uses Mastra for agent orchestration:

```typescript
// src/backend/src/mastra/index.ts
export const mastra = new Mastra({
  agents: { starterAgent },      // AI agents
  workflows: { chatWorkflow },   // Orchestration
  storage,                       // Persistence
  server: { apiRoutes },         // API endpoints
});
```

### Agent System
Agents are the core of your application:

```typescript
// src/backend/src/mastra/agents/starterAgent.ts
export const starterAgent = new Agent({
  name: 'Starter Agent',
  instructions: '...',           // System prompt
  model: openai('gpt-4o-mini'),
  tools: { ... },                // Available tools
  memory,                        // Conversation history
});
```

### Workflows
Workflows orchestrate complex multi-step processes:

```typescript
// src/backend/src/mastra/workflows/chatWorkflow.ts
export const chatWorkflow = createWorkflow({
  id: 'chatWorkflow',
  inputSchema: ChatInputSchema,
  outputSchema: ChatOutputSchema,
})
  .then(callAgent)               // Step 1: Call agent
  .commit();
```

### Tools System
Tools enable agents to take actions:

1. **Frontend Tools** - Execute in the browser (UI updates)
2. **Backend Tools** - Execute on the server (API calls, search)
3. **State Setters** - Special tools for updating Cedar state

```typescript
// Example tool definition
export const webSearchTool = createTool({
  id: 'web-search',
  description: 'Search the web for information',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.object({ results: z.array(...) }),
  execute: async ({ context }) => { ... },
});
```

## Data Flow

### User Message Flow
```
1. User types message in Cedar UI
   ↓
2. Frontend sends POST to /chat/execute-function/stream
   ↓
3. chatWorkflow receives message
   ↓
4. starterAgent processes with OpenAI
   ↓
5. Agent may call tools (web search, state setters, etc.)
   ↓
6. Response streams back via SSE
   ↓
7. Cedar UI renders response
   ↓
8. Message saved to chat history
```

### Tool Execution Flow
```
1. Agent decides to use a tool
   ↓
2. Tool call streamed to frontend
   ↓
3. Tool executes (frontend or backend)
   ↓
4. Result returned to agent
   ↓
5. Agent continues reasoning
   ↓
6. Final response to user
```

## Storage Architecture

### Development (Default)
- **Chat History**: Browser localStorage
- **Agent Memory**: LibSQL (src/backend/storage.db)

### Production (Recommended)
- **Chat History**: Supabase with localStorage fallback
- **Agent Memory**: Supabase or PostgreSQL
- **File Uploads**: Supabase Storage

See [Chat History](./chat-history.md) for migration guide.

## API Endpoints

### Chat Endpoints
```
POST /chat/execute-function        # Non-streaming chat
POST /chat/execute-function/stream # Streaming chat (recommended)
```

### API Request Format
```typescript
{
  prompt: string;              // User message
  temperature?: number;        // Model temperature
  maxTokens?: number;          // Max response length
  systemPrompt?: string;       // Override system prompt
  additionalContext?: any;     // Extra context
  threadId?: string;           // Conversation thread
  resourceId?: string;         // User/resource ID
}
```

### Streaming Response Format
Server-Sent Events with:
- **Text chunks**: Raw text deltas
- **JSON events**: Tool calls, status updates
- **Completion**: `event: done` signal

## State Management

### Cedar State
Cedar provides a powerful state management system:

```typescript
// Register state
useRegisterState({
  key: 'myState',
  value: state,
  setValue: setState,
  stateSetters: { ... },
});

// Subscribe to backend
useSubscribeStateToAgentContext('myState', (state) => ({ state }));
```

### Chat History State
Local-first with cloud sync:

```typescript
// Save to localStorage
saveChatHistory(conversationId, messages);

// Sync to Supabase (when configured)
syncToDatabase(conversationId, messages);
```

## Security Architecture

### Authentication (Auth0)
- User authentication with Universal Login
- API access tokens for agent actions
- Token Vault for third-party API calls
- Asynchronous authorization (CIBA)

See [Authentication](./authentication.md) for details.

### API Security
- Environment variables for secrets
- CORS configuration
- Rate limiting (recommended for production)
- Input validation with Zod schemas

## Performance Considerations

### Streaming
- Use streaming endpoints for better UX
- Show progress with intermediate updates
- Handle connection errors gracefully

### Caching
- Cache tool results when appropriate
- Use React Query for frontend state
- Implement Redis for production caching

### Error Handling
- Comprehensive error boundaries
- Graceful degradation
- User-friendly error messages

See [Error Handling](./error-handling.md) for patterns.

## Extension Points

Want to customize? Start here:

1. **Add Tools**: `src/backend/src/mastra/tools/`
2. **Modify Agent**: `src/backend/src/mastra/agents/`
3. **Custom Workflows**: `src/backend/src/mastra/workflows/`
4. **UI Components**: `src/components/`
5. **Storage Backend**: `src/lib/storage/`

## Next Steps

- 🔧 [Build your first tool](./tools-system.md)
- 💾 [Set up chat history](./chat-history.md)
- 🔐 [Add authentication](./authentication.md)
