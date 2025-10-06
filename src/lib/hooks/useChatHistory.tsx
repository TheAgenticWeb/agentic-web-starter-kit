'use client';

/**
 * React hook for managing chat history
 * Works with both localStorage and Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  createChatStorage,
  type Message,
  type Conversation,
} from '../storage';

export function useChatHistory(userId?: string) {
  const [storage] = useState(() => createChatStorage(userId));
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const convs = await storage.listConversations();
      setConversations(convs);

      // Set current conversation to most recent if none selected
      if (!currentConversation && convs.length > 0) {
        setCurrentConversation(convs[0]);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load conversations';
      setError(message);
      console.error('Error loading conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [storage, currentConversation]);

  const createNewConversation = useCallback(
    async (title?: string) => {
      try {
        setError(null);
        const conversation = await storage.createConversation(title);
        setConversations((prev) => [conversation, ...prev]);
        setCurrentConversation(conversation);
        return conversation;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to create conversation';
        setError(message);
        console.error('Error creating conversation:', err);
        throw err;
      }
    },
    [storage]
  );

  const switchConversation = useCallback(
    async (conversationId: string) => {
      try {
        setError(null);
        const conversation = await storage.getConversation(conversationId);
        if (conversation) {
          setCurrentConversation(conversation);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to switch conversation';
        setError(message);
        console.error('Error switching conversation:', err);
      }
    },
    [storage]
  );

  const addMessage = useCallback(
    async (message: Omit<Message, 'id' | 'timestamp'>) => {
      try {
        setError(null);

        // Create conversation if none exists
        let conv = currentConversation;
        if (!conv) {
          conv = await createNewConversation();
        }

        const fullMessage: Message = {
          id: uuidv4(),
          timestamp: new Date(),
          ...message,
        };

        await storage.saveMessage(conv.id, fullMessage);

        // Update local state
        setCurrentConversation((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, fullMessage],
            updatedAt: new Date(),
          };
        });

        // Update conversation in list
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conv!.id
              ? {
                  ...c,
                  messages: [...c.messages, fullMessage],
                  updatedAt: new Date(),
                }
              : c
          )
        );

        return fullMessage;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to add message';
        setError(message);
        console.error('Error adding message:', err);
        throw err;
      }
    },
    [storage, currentConversation, createNewConversation]
  );

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        setError(null);
        await storage.deleteConversation(conversationId);

        setConversations((prev) =>
          prev.filter((c) => c.id !== conversationId)
        );

        if (currentConversation?.id === conversationId) {
          setCurrentConversation(null);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to delete conversation';
        setError(message);
        console.error('Error deleting conversation:', err);
        throw err;
      }
    },
    [storage, currentConversation]
  );

  const updateConversationTitle = useCallback(
    async (conversationId: string, title: string) => {
      try {
        setError(null);
        await storage.updateConversation(conversationId, { title });

        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, title } : c))
        );

        if (currentConversation?.id === conversationId) {
          setCurrentConversation((prev) =>
            prev ? { ...prev, title } : null
          );
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to update conversation';
        setError(message);
        console.error('Error updating conversation:', err);
        throw err;
      }
    },
    [storage, currentConversation]
  );

  const clearAllHistory = useCallback(async () => {
    try {
      setError(null);
      await storage.clearAll();
      setConversations([]);
      setCurrentConversation(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to clear history';
      setError(message);
      console.error('Error clearing history:', err);
      throw err;
    }
  }, [storage]);

  return {
    // State
    conversations,
    currentConversation,
    messages: currentConversation?.messages || [],
    isLoading,
    error,

    // Actions
    createNewConversation,
    switchConversation,
    addMessage,
    deleteConversation,
    updateConversationTitle,
    clearAllHistory,
    refreshConversations: loadConversations,
  };
}
