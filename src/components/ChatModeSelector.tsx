import React from 'react';
import { MessageCircle, PanelRight, Type } from 'lucide-react';

type ChatMode = 'floating' | 'sidepanel' | 'caption';

interface ChatModeSelectorProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

export function ChatModeSelector({ currentMode, onModeChange }: ChatModeSelectorProps) {
  const modes = [
    {
      id: 'caption' as const,
      label: 'Caption',
      icon: <Type className="w-4 h-4" />,
      description: 'Bottom caption style chat',
    },
    {
      id: 'floating' as const,
      label: 'Floating',
      icon: <MessageCircle className="w-4 h-4" />,
      description: 'Resizable floating chat window',
    },
    {
      id: 'sidepanel' as const,
      label: 'Side Panel',
      icon: <PanelRight className="w-4 h-4" />,
      description: 'Dedicated side panel layout',
    },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-500">Chat Mode:</span>
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${
                currentMode === mode.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }
            `}
            title={mode.description}
          >
            {mode.icon}
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}
