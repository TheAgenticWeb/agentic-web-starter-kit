/**
 * Storage interface for chat history
 * Abstracts the storage layer to allow easy swapping between localStorage and Supabase
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    tokens?: number;
    model?: string;
    toolCalls?: Array<{
      tool: string;
      input: any;
      output: any;
    }>;
    error?: string;
  };
}

export interface Conversation {
  id: string;
  title?: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: {
    totalTokens?: number;
    messageCount?: number;
    userId?: string;
  };
}

export interface ChatStorageAdapter {
  // Message operations
  saveMessage(conversationId: string, message: Message): Promise<void>;
  getMessages(conversationId: string): Promise<Message[]>;
  deleteMessage(messageId: string): Promise<void>;
  updateMessage(messageId: string, updates: Partial<Message>): Promise<void>;

  // Conversation operations
  listConversations(): Promise<Conversation[]>;
  getConversation(conversationId: string): Promise<Conversation | null>;
  createConversation(title?: string): Promise<Conversation>;
  updateConversation(
    conversationId: string,
    updates: Partial<Conversation>
  ): Promise<void>;
  deleteConversation(conversationId: string): Promise<void>;

  // Utility
  clearAll(): Promise<void>;
}
