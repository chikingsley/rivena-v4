'use client';

import { Message } from 'ai';
import { useChat } from '@ai-sdk/react';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';

// Use relative URL that works both in development and production
const API_URL = '/api/chat';

interface ChatProps {
  id?: string;
  initialMessages?: Message[];
}

export function Chat({ id, initialMessages = [] }: ChatProps) {
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    stop
  } = useChat({
    id,
    initialMessages,
    api: API_URL,
    sendExtraMessageFields: true,
    onError: (error: Error) => {
      console.error('Chat error:', error);
      alert('An error occurred while sending your message. Please try again.');
    }
  });

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <header className="p-4 border-b bg-white">
        <h1 className="text-xl font-bold">AI Chat</h1>
      </header>
      
      <div className="flex-1 flex flex-col overflow-hidden px-4">
        <div className="flex-1 overflow-hidden">
          <Messages messages={messages} isLoading={isLoading} />
        </div>
        
        <div className="py-4 border-t bg-white">
          <MultimodalInput
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
          />
        </div>
      </div>
    </div>
  );
} 