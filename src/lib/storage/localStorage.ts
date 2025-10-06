/**
 * localStorage implementation of ChatStorageAdapter
 * Perfect for development and simple deployments
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  ChatStorageAdapter,
  Conversation,
  Message,
} from './interface';

interface StorageData {
  conversations: Record<string, Conversation>;
}

export class LocalStorageChatAdapter implements ChatStorageAdapter {
  private storageKey = 'agentic-web-chat-history';

  private getAll(): StorageData {
    if (typeof window === 'undefined') {
      return { conversations: {} };
    }

    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        return { conversations: {} };
      }

      const parsed = JSON.parse(data);

      // Convert date strings back to Date objects
      Object.values(parsed.conversations || {}).forEach((conv: any) => {
        conv.createdAt = new Date(conv.createdAt);
        conv.updatedAt = new Date(conv.updatedAt);
        conv.messages?.forEach((msg: any) => {
          msg.timestamp = new Date(msg.timestamp);
        });
      });

      return parsed;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return { conversations: {} };
    }
  }

  private saveAll(data: StorageData): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      throw new Error('Failed to save to localStorage');
    }
  }

  async saveMessage(conversationId: string, message: Message): Promise<void> {
    const data = this.getAll();

    if (!data.conversations[conversationId]) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    data.conversations[conversationId].messages.push(message);
    data.conversations[conversationId].updatedAt = new Date();
    data.conversations[conversationId].metadata = {
      ...data.conversations[conversationId].metadata,
      messageCount: data.conversations[conversationId].messages.length,
      totalTokens:
        (data.conversations[conversationId].metadata?.totalTokens || 0) +
        (message.metadata?.tokens || 0),
    };

    this.saveAll(data);
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const data = this.getAll();
    return data.conversations[conversationId]?.messages || [];
  }

  async deleteMessage(messageId: string): Promise<void> {
    const data = this.getAll();

    for (const conv of Object.values(data.conversations)) {
      const index = conv.messages.findIndex((m) => m.id === messageId);
      if (index !== -1) {
        conv.messages.splice(index, 1);
        conv.updatedAt = new Date();
        this.saveAll(data);
        return;
      }
    }

    throw new Error(`Message ${messageId} not found`);
  }

  async updateMessage(
    messageId: string,
    updates: Partial<Message>
  ): Promise<void> {
    const data = this.getAll();

    for (const conv of Object.values(data.conversations)) {
      const message = conv.messages.find((m) => m.id === messageId);
      if (message) {
        Object.assign(message, updates);
        conv.updatedAt = new Date();
        this.saveAll(data);
        return;
      }
    }

    throw new Error(`Message ${messageId} not found`);
  }

  async listConversations(): Promise<Conversation[]> {
    const data = this.getAll();
    return Object.values(data.conversations).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const data = this.getAll();
    return data.conversations[conversationId] || null;
  }

  async createConversation(title?: string): Promise<Conversation> {
    const data = this.getAll();

    const conversation: Conversation = {
      id: uuidv4(),
      title: title || 'New Conversation',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        totalTokens: 0,
        messageCount: 0,
      },
    };

    data.conversations[conversation.id] = conversation;
    this.saveAll(data);

    return conversation;
  }

  async updateConversation(
    conversationId: string,
    updates: Partial<Conversation>
  ): Promise<void> {
    const data = this.getAll();

    if (!data.conversations[conversationId]) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    Object.assign(data.conversations[conversationId], updates);
    data.conversations[conversationId].updatedAt = new Date();
    this.saveAll(data);
  }

  async deleteConversation(conversationId: string): Promise<void> {
    const data = this.getAll();

    if (!data.conversations[conversationId]) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    delete data.conversations[conversationId];
    this.saveAll(data);
  }

  async clearAll(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }
}
