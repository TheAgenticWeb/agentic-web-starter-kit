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
import { CedarCaptionChat } from '@/cedar/components/chatComponents/CedarCaptionChat';
import { FloatingCedarChat } from '@/cedar/components/chatComponents/FloatingCedarChat';
import { SidePanelCedarChat } from '@/cedar/components/chatComponents/SidePanelCedarChat';
import { DebuggerPanel } from '@/cedar/components/debugger';

type ChatMode = 'floating' | 'sidepanel' | 'caption';

// Thread-scoped state storage
interface ThreadState {
  mainText: string;
  textLines: string[];
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
          setMainText(currentState.mainText);
          setTextLines(currentState.textLines);
        }
      }
    } catch (error) {
      console.error('Failed to load thread states:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // State for the main text that can be changed by the agent
  const [mainText, setMainText] = React.useState('Welcome to Your Agentic App');

  // State for dynamically added text lines
  const [textLines, setTextLines] = React.useState<string[]>([]);

  // Handle thread switching and persistence
  React.useEffect(() => {
    if (!isLoaded) return; // Don't run until initial load is complete

    const previousThreadId = previousThreadIdRef.current;
    
    // If thread changed, save previous thread's state and load new thread's state
    if (previousThreadId !== currentThreadId) {
      // Save previous thread's state
      threadStatesRef.current[previousThreadId] = { mainText, textLines };
      
      // Load new thread's state (or use defaults)
      const newThreadState = threadStatesRef.current[currentThreadId];
      if (newThreadState) {
        setMainText(newThreadState.mainText);
        setTextLines(newThreadState.textLines);
      } else {
        // New thread - reset to defaults
        setMainText('Welcome to Your Agentic App');
        setTextLines([]);
      }
      
      // Update ref
      previousThreadIdRef.current = currentThreadId;
    } else {
      // Same thread - just keep the ref updated with current state
      threadStatesRef.current[currentThreadId] = { mainText, textLines };
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
  }, [currentThreadId, mainText, textLines, isLoaded]);

  // Register the main text as state with a state setter (thread-scoped)
  useRegisterState({
    key: 'mainText',
    description: `The main text that can be modified by the agent. This state is scoped to the current thread (${currentThreadId}).`,
    value: mainText,
    setValue: setMainText,
    stateSetters: {
      changeText: {
        name: 'changeText',
        description: 'Change the main text to a new value for the current thread',
        argsSchema: z.object({
          newText: z.string().min(1, 'Text cannot be empty').describe('The new text to display'),
        }),
        execute: (
          currentText: string,
          setValue: (newValue: string) => void,
          args: { newText: string },
        ) => {
          setValue(args.newText);
        },
      },
    },
  });

  // Subscribe the main text state to the backend
  useSubscribeStateToAgentContext('mainText', (mainText) => ({ mainText }), {
    showInChat: true,
    color: '#4F46E5',
  });

  // Register frontend tool for adding text lines
  useRegisterFrontendTool({
    name: 'addNewTextLine',
    description: 'Add a new line of text to the screen via frontend tool',
    argsSchema: z.object({
      text: z.string().min(1, 'Text cannot be empty').describe('The text to add to the screen'),
      style: z
        .enum(['normal', 'bold', 'italic', 'highlight'])
        .optional()
        .describe('Text style to apply'),
    }),
    execute: async (args: { text: string; style?: 'normal' | 'bold' | 'italic' | 'highlight' }) => {
      const styledText =
        args.style === 'bold'
          ? `**${args.text}**`
          : args.style === 'italic'
            ? `*${args.text}*`
            : args.style === 'highlight'
              ? `🌟 ${args.text} 🌟`
              : args.text;
      setTextLines((prev) => [...prev, styledText]);
    },
  });

  const renderContent = () => (
    <div className="relative h-screen w-full">
      <ChatModeSelector currentMode={chatMode} onModeChange={setChatMode} />

      {/* Main interactive content area */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 space-y-8">
        {/* Big text that the agent can change */}
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">{mainText}</h1>
          <p className="text-lg text-gray-600 mb-8">
            Try: "Change the main text to 'Hello World'"
          </p>
        </div>

        {/* Instructions for adding new text */}
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Chat with your AI agent
          </h2>
          <p className="text-md text-gray-500 mb-6">
            Try: "Add a new line saying 'This is awesome'"
          </p>
        </div>

        {/* Display dynamically added text lines */}
        {textLines.length > 0 && (
          <div className="w-full max-w-2xl">
            <h3 className="text-xl font-medium text-gray-700 mb-4 text-center">Added by Agent:</h3>
            <div className="space-y-2">
              {textLines.map((line, index) => (
                <div
                  key={index}
                  className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center"
                >
                  {line.startsWith('**') && line.endsWith('**') ? (
                    <strong className="text-blue-800">{line.slice(2, -2)}</strong>
                  ) : line.startsWith('*') && line.endsWith('*') ? (
                    <em className="text-blue-700">{line.slice(1, -1)}</em>
                  ) : line.startsWith('🌟') ? (
                    <span className="text-yellow-600 font-semibold">{line}</span>
                  ) : (
                    <span className="text-blue-800">{line}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {chatMode === 'caption' && <CedarCaptionChat />}

      {chatMode === 'floating' && (
        <FloatingCedarChat side="right" title="AI Assistant" collapsedLabel="Chat" />
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
            title="AI Assistant"
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
