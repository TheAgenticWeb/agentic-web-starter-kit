'use client';

/**
 * Conversation Sidebar Component
 * Integrates with Cedar's native thread management system
 */

import React from 'react';
import { useThreadController, useCedarStore } from 'cedar-os';
import { PlusIcon, TrashIcon, MessageSquareIcon } from 'lucide-react';

export function ConversationSidebar() {
  const {
    currentThreadId,
    threadIds,
    createThread,
    deleteThread,
    switchThread,
    updateThreadName,
  } = useThreadController();

  // Get thread methods from Cedar store
  const getThreadMessages = useCedarStore((state) => state.getThreadMessages);
  const getThread = useCedarStore((state) => state.getThread);

  const handleNewChat = () => {
    const now = new Date();
    const title = `Chat ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    const newThreadId = createThread(undefined, title);
    switchThread(newThreadId);
  };

  const handleDelete = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      deleteThread(threadId);
    }
  };

  return (
    <div className="w-64 h-full bg-gray-50 border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <PlusIcon className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2">
        {threadIds.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            <MessageSquareIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No conversations yet</p>
            <p className="text-xs mt-1">Start a new chat!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {threadIds.map((threadId) => {
              const thread = getThread(threadId);
              const messages = getThreadMessages(threadId);
              const messageCount = messages?.length || 0;
              
              return (
                <div
                  key={threadId}
                  onClick={() => switchThread(threadId)}
                  className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                    currentThreadId === threadId
                      ? 'bg-blue-100 border border-blue-200'
                      : 'hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          currentThreadId === threadId
                            ? 'text-blue-900'
                            : 'text-gray-900'
                        }`}
                      >
                        {thread?.name || 'Untitled Chat'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {messageCount} message{messageCount !== 1 ? 's' : ''}
                      </p>
                      {threadId !== currentThreadId && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Thread ID: {threadId.slice(0, 8)}...
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, threadId)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
                      title="Delete conversation"
                    >
                      <TrashIcon className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {threadIds.length > 0 && (
        <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex justify-between">
            <span>Total conversations:</span>
            <span className="font-medium">{threadIds.length}</span>
          </div>
          <div className="mt-1 text-gray-400">
            The Agentic Web Starter Kit
          </div>
        </div>
      )}
    </div>
  );
}
