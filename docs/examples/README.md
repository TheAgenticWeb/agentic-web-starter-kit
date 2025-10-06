# Examples

Code examples for common use cases in your agentic web application.

## Quick Examples

### 1. Using Chat History

```typescript
// src/app/my-chat/page.tsx
'use client';

import { useChatHistory } from '@/lib/hooks/useChatHistory';

export default function MyChat() {
  const {
    messages,
    addMessage,
    conversations,
    createNewConversation,
  } = useChatHistory();

  const handleSend = async (text: string) => {
    // Add user message
    await addMessage({
      role: 'user',
      content: text,
    });

    // Call your agent
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt: text }),
    });

    const data = await response.json();

    // Add assistant response
    await addMessage({
      role: 'assistant',
      content: data.content,
      metadata: {
        tokens: data.usage?.total_tokens,
        model: 'gpt-4o-mini',
      },
    });
  };

  return (
    <div>
      <h1>Conversations: {conversations.length}</h1>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
    </div>
  );
}
```

### 2. Creating a Custom Tool

```typescript
// src/backend/src/mastra/tools/weatherTool.ts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string().describe('City name'),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    condition: z.string(),
  }),
  execute: async ({ context }) => {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${context.location}`
    );
    
    const data = await response.json();
    
    return {
      temperature: data.current.temp_c,
      condition: data.current.condition.text,
    };
  },
});

// Then add to toolDefinitions.ts:
// export const ALL_TOOLS = [..., weatherTool];
```

### 3. Protected API Route with Auth0

```typescript
// src/app/api/protected/route.ts
import { getSession } from '@auth0/nextjs-auth0';

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return Response.json({
    message: 'Protected data',
    user: session.user,
  });
}
```

### 4. Error Handling in Components

```typescript
// src/app/my-feature/page.tsx
'use client';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useState } from 'react';
import { getUserFriendlyError } from '@/lib/errors';

function MyFeature() {
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    try {
      await riskyOperation();
    } catch (err) {
      setError(getUserFriendlyError(err));
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={handleAction}>Do Something</button>
    </div>
  );
}

export default function Page() {
  return (
    <ErrorBoundary>
      <MyFeature />
    </ErrorBoundary>
  );
}
```

### 5. Retry Logic for API Calls

```typescript
// src/lib/api/client.ts
import { withRetry } from '@/lib/utils/retry';

export async function callExternalAPI(data: any) {
  return withRetry(
    async () => {
      const response = await fetch('https://api.example.com', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return response.json();
    },
    {
      maxRetries: 3,
      baseDelay: 1000,
    }
  );
}
```

### 6. Multi-Conversation Chat UI

```typescript
// src/components/ConversationList.tsx
'use client';

import { useChatHistory } from '@/lib/hooks/useChatHistory';

export function ConversationList() {
  const {
    conversations,
    currentConversation,
    switchConversation,
    createNewConversation,
    deleteConversation,
  } = useChatHistory();

  return (
    <div className="w-64 border-r">
      <button
        onClick={() => createNewConversation('New Chat')}
        className="w-full p-2 bg-blue-600 text-white"
      >
        + New Conversation
      </button>

      <div className="space-y-2 p-2">
        {conversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => switchConversation(conv.id)}
            className={`p-2 rounded cursor-pointer ${
              currentConversation?.id === conv.id
                ? 'bg-blue-100'
                : 'hover:bg-gray-100'
            }`}
          >
            <div className="font-medium">{conv.title}</div>
            <div className="text-xs text-gray-500">
              {conv.messages.length} messages
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteConversation(conv.id);
              }}
              className="text-red-600 text-xs"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 7. Web Search in Agent

The web search tool is already integrated. Agents can automatically use it:

```typescript
// The agent can now answer questions like:
// "What are the latest AI developments in 2025?"
// "Search for information about quantum computing"

// No additional code needed - just ensure EXA_API_KEY is set!
```

### 8. Supabase Migration

```typescript
// src/lib/storage/migrate.ts
import { LocalStorageChatAdapter } from './localStorage';
import { SupabaseChatAdapter } from './supabase';
import { createClient } from '@supabase/supabase-js';

export async function migrateToSupabase() {
  const localStorage = new LocalStorageChatAdapter();
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const supabaseAdapter = new SupabaseChatAdapter(supabase);
  
  // Get all conversations from localStorage
  const conversations = await localStorage.listConversations();
  
  console.log(`Migrating ${conversations.length} conversations...`);
  
  for (const conv of conversations) {
    // Create conversation in Supabase
    const newConv = await supabaseAdapter.createConversation(conv.title);
    
    // Copy all messages
    for (const message of conv.messages) {
      await supabaseAdapter.saveMessage(newConv.id, message);
    }
    
    console.log(`Migrated: ${conv.title}`);
  }
  
  console.log('Migration complete!');
}

// Run migration:
// import { migrateToSupabase } from '@/lib/storage/migrate';
// await migrateToSupabase();
```

## More Examples

See the full documentation:
- [Tools System](../tools-system.md) - More tool examples
- [Chat History](../chat-history.md) - Advanced chat patterns
- [Error Handling](../error-handling.md) - Error handling patterns
- [Authentication](../authentication.md) - Auth examples
