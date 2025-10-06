/**
 * Supabase implementation of ChatStorageAdapter
 * For production deployments with multi-device sync
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  ChatStorageAdapter,
  Conversation,
  Message,
} from './interface';

// Supabase client type (install with: pnpm add @supabase/supabase-js)
type SupabaseClient = any;

export class SupabaseChatAdapter implements ChatStorageAdapter {
  constructor(
    private supabase: SupabaseClient,
    private userId?: string
  ) {}

  async saveMessage(conversationId: string, message: Message): Promise<void> {
    const { error } = await this.supabase.from('messages').insert({
      id: message.id,
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      created_at: message.timestamp.toISOString(),
      metadata: message.metadata || {},
    });

    if (error) {
      console.error('Supabase error saving message:', error);
      throw new Error(`Failed to save message: ${error.message}`);
    }

    // Update conversation updated_at
    await this.supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error getting messages:', error);
      throw new Error(`Failed to get messages: ${error.message}`);
    }

    return (data || []).map(this.mapToMessage);
  }

  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await this.supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      console.error('Supabase error deleting message:', error);
      throw new Error(`Failed to delete message: ${error.message}`);
    }
  }

  async updateMessage(
    messageId: string,
    updates: Partial<Message>
  ): Promise<void> {
    const updateData: any = {};

    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

    const { error } = await this.supabase
      .from('messages')
      .update(updateData)
      .eq('id', messageId);

    if (error) {
      console.error('Supabase error updating message:', error);
      throw new Error(`Failed to update message: ${error.message}`);
    }
  }

  async listConversations(): Promise<Conversation[]> {
    let query = this.supabase
      .from('conversations')
      .select('*, messages(*)')
      .order('updated_at', { ascending: false });

    if (this.userId) {
      query = query.eq('user_id', this.userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error listing conversations:', error);
      throw new Error(`Failed to list conversations: ${error.message}`);
    }

    return (data || []).map(this.mapToConversation);
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const { data, error } = await this.supabase
      .from('conversations')
      .select('*, messages(*)')
      .eq('id', conversationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('Supabase error getting conversation:', error);
      throw new Error(`Failed to get conversation: ${error.message}`);
    }

    return this.mapToConversation(data);
  }

  async createConversation(title?: string): Promise<Conversation> {
    const id = uuidv4();
    const now = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('conversations')
      .insert({
        id,
        title: title || 'New Conversation',
        user_id: this.userId,
        created_at: now,
        updated_at: now,
        metadata: {
          totalTokens: 0,
          messageCount: 0,
        },
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating conversation:', error);
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    return {
      id: data.id,
      title: data.title,
      messages: [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      metadata: data.metadata,
    };
  }

  async updateConversation(
    conversationId: string,
    updates: Partial<Conversation>
  ): Promise<void> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

    const { error } = await this.supabase
      .from('conversations')
      .update(updateData)
      .eq('id', conversationId);

    if (error) {
      console.error('Supabase error updating conversation:', error);
      throw new Error(`Failed to update conversation: ${error.message}`);
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    // Messages will be deleted by cascade
    const { error } = await this.supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Supabase error deleting conversation:', error);
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
  }

  async clearAll(): Promise<void> {
    if (!this.userId) {
      throw new Error('Cannot clear all without userId');
    }

    const { error } = await this.supabase
      .from('conversations')
      .delete()
      .eq('user_id', this.userId);

    if (error) {
      console.error('Supabase error clearing all:', error);
      throw new Error(`Failed to clear all: ${error.message}`);
    }
  }

  private mapToMessage(row: any): Message {
    return {
      id: row.id,
      role: row.role,
      content: row.content,
      timestamp: new Date(row.created_at),
      metadata: row.metadata,
    };
  }

  private mapToConversation(row: any): Conversation {
    return {
      id: row.id,
      title: row.title,
      messages: (row.messages || [])
        .map(this.mapToMessage)
        .sort(
          (a: Message, b: Message) =>
            a.timestamp.getTime() - b.timestamp.getTime()
        ),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      metadata: row.metadata,
    };
  }
}
