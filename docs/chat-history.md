# Chat History

Learn how to persist and manage chat conversations in your agentic web application.

## Overview

The starter kit includes a flexible chat history system that:
- ✅ Works out of the box with **localStorage** (no setup required)
- ✅ Provides easy migration to **Supabase** for production
- ✅ Supports multiple conversations/threads
- ✅ Syncs across tabs (same browser)
- ✅ Handles message metadata (timestamps, tokens, etc.)

## Quick Start (localStorage)

The default implementation uses browser localStorage - no configuration needed!

```typescript
import { useChatHistory } from '@/lib/hooks/useChatHistory';

function MyChat() {
  const {
    messages,
    addMessage,
    clearHistory,
    conversations,
    currentConversation,
    switchConversation,
  } = useChatHistory();

  // Messages automatically persist to localStorage
  const handleNewMessage = (text: string, role: 'user' | 'assistant') => {
    addMessage({
      id: generateId(),
      role,
      content: text,
      timestamp: new Date(),
    });
  };

  return <CedarChatInterface messages={messages} />;
}
```

## Architecture

### Storage Interface

The system uses an abstraction layer for easy swapping:

```typescript
// src/lib/storage/interface.ts
export interface ChatStorageAdapter {
  // Messages
  saveMessage(conversationId: string, message: Message): Promise<void>;
  getMessages(conversationId: string): Promise<Message[]>;
  deleteMessage(messageId: string): Promise<void>;
  
  // Conversations
  listConversations(): Promise<Conversation[]>;
  createConversation(title?: string): Promise<Conversation>;
  deleteConversation(conversationId: string): Promise<void>;
}
```

### localStorage Adapter (Default)

```typescript
// src/lib/storage/localStorage.ts
export class LocalStorageChatAdapter implements ChatStorageAdapter {
  private storageKey = 'agentic-web-chat-history';
  
  async saveMessage(conversationId: string, message: Message) {
    const conversations = this.getAll();
    const conversation = conversations[conversationId] || { 
      id: conversationId, 
      messages: [] 
    };
    
    conversation.messages.push(message);
    conversation.updatedAt = new Date();
    
    conversations[conversationId] = conversation;
    localStorage.setItem(this.storageKey, JSON.stringify(conversations));
  }
  
  // ... other methods
}
```

### Supabase Adapter (Production)

```typescript
// src/lib/storage/supabase.ts
export class SupabaseChatAdapter implements ChatStorageAdapter {
  constructor(private supabase: SupabaseClient) {}
  
  async saveMessage(conversationId: string, message: Message) {
    const { error } = await this.supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
        metadata: message.metadata,
        created_at: message.timestamp,
      });
    
    if (error) throw error;
  }
  
  async getMessages(conversationId: string) {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data.map(this.mapToMessage);
  }
  
  // ... other methods
}
```

## Data Model

### Message Schema

```typescript
export interface Message {
  id: string;                    // Unique message ID
  role: 'user' | 'assistant' | 'system';
  content: string;               // Message text
  timestamp: Date;               // When created
  metadata?: {
    tokens?: number;             // Token count
    model?: string;              // Model used
    toolCalls?: ToolCall[];      // Tools executed
    error?: string;              // Error if any
  };
}
```

### Conversation Schema

```typescript
export interface Conversation {
  id: string;                    // Unique conversation ID
  title?: string;                // Display name
  messages: Message[];           // All messages
  createdAt: Date;              // When created
  updatedAt: Date;              // Last activity
  metadata?: {
    totalTokens?: number;        // Total tokens used
    messageCount?: number;       // Number of messages
    userId?: string;             // Owner (with auth)
  };
}
```

## Migration to Supabase

### 1. Set Up Supabase

Create tables in your Supabase project:

```sql
-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_conversations_user ON conversations(user_id, updated_at DESC);

-- Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can only access their own conversations
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only access messages in their conversations
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own messages"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );
```

### 2. Update Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Switch Storage Adapter

```typescript
// src/lib/storage/index.ts
import { createClient } from '@supabase/supabase-js';
import { SupabaseChatAdapter } from './supabase';
import { LocalStorageChatAdapter } from './localStorage';

// Choose adapter based on environment
export function createChatStorage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    return new SupabaseChatAdapter(supabase);
  }
  
  // Fallback to localStorage
  return new LocalStorageChatAdapter();
}
```

### 4. Migrate Existing Data

```typescript
// src/lib/storage/migrate.ts
export async function migrateToSupabase() {
  const localStorage = new LocalStorageChatAdapter();
  const supabase = new SupabaseChatAdapter(createClient(...));
  
  const conversations = await localStorage.listConversations();
  
  for (const conversation of conversations) {
    // Create conversation in Supabase
    const newConv = await supabase.createConversation(conversation.title);
    
    // Copy all messages
    for (const message of conversation.messages) {
      await supabase.saveMessage(newConv.id, message);
    }
  }
  
  console.log(`Migrated ${conversations.length} conversations to Supabase`);
}
```

## Usage Examples

### Basic Chat

```typescript
import { useChatHistory } from '@/lib/hooks/useChatHistory';

function BasicChat() {
  const { messages, addMessage, isLoading } = useChatHistory();
  
  const handleSend = async (text: string) => {
    // Add user message
    await addMessage({
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    });
    
    // Get AI response
    const response = await callAgent(text);
    
    // Add assistant message
    await addMessage({
      id: generateId(),
      role: 'assistant',
      content: response.text,
      timestamp: new Date(),
      metadata: {
        tokens: response.usage.total_tokens,
        model: 'gpt-4o-mini',
      },
    });
  };
  
  return <CedarChat messages={messages} onSend={handleSend} />;
}
```

### Multiple Conversations

```typescript
function MultiConversationChat() {
  const {
    conversations,
    currentConversation,
    switchConversation,
    createNewConversation,
  } = useChatHistory();
  
  return (
    <div>
      <ConversationList
        conversations={conversations}
        current={currentConversation}
        onSelect={switchConversation}
        onNew={createNewConversation}
      />
      <ChatInterface conversationId={currentConversation?.id} />
    </div>
  );
}
```

### With Metadata

```typescript
const handleToolUse = async (query: string) => {
  const toolResult = await webSearchTool.execute({ query });
  
  await addMessage({
    id: generateId(),
    role: 'assistant',
    content: toolResult.summary,
    timestamp: new Date(),
    metadata: {
      toolCalls: [{
        tool: 'web-search',
        input: { query },
        output: toolResult,
      }],
    },
  });
};
```

## Best Practices

### 1. Message Limits
Implement pagination for large conversations:

```typescript
const MAX_MESSAGES_DISPLAY = 50;

const recentMessages = messages.slice(-MAX_MESSAGES_DISPLAY);
```

### 2. Token Tracking
Track usage for cost management:

```typescript
const totalTokens = messages.reduce(
  (sum, msg) => sum + (msg.metadata?.tokens || 0),
  0
);

if (totalTokens > 100000) {
  console.warn('High token usage in this conversation');
}
```

### 3. Error Recovery
Handle storage failures gracefully:

```typescript
try {
  await addMessage(message);
} catch (error) {
  console.error('Failed to save message:', error);
  // Keep in memory only
  setLocalMessages(prev => [...prev, message]);
}
```

### 4. Cleanup Old Conversations

```typescript
const cleanupOldConversations = async (daysToKeep = 30) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysToKeep);
  
  const conversations = await storage.listConversations();
  for (const conv of conversations) {
    if (conv.updatedAt < cutoff) {
      await storage.deleteConversation(conv.id);
    }
  }
};
```

## Testing

```typescript
// Example test
describe('ChatHistory', () => {
  it('should persist messages to localStorage', async () => {
    const storage = new LocalStorageChatAdapter();
    const message = {
      id: '1',
      role: 'user' as const,
      content: 'Hello',
      timestamp: new Date(),
    };
    
    await storage.saveMessage('conv-1', message);
    const messages = await storage.getMessages('conv-1');
    
    expect(messages).toHaveLength(1);
    expect(messages[0].content).toBe('Hello');
  });
});
```

## Advanced: Real-time Sync

For multi-device sync with Supabase:

```typescript
// Subscribe to changes
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, (payload) => {
    addMessageToUI(payload.new);
  })
  .subscribe();
```

## Next Steps

- 🔧 [Learn about the tools system](./tools-system.md)
- 🔐 [Add authentication](./authentication.md)
- 🏗️ [Understanding the architecture](./architecture.md)
