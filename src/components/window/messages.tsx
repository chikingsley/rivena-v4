'use client';

import { Message } from 'ai';
import { useEffect, useRef } from 'react';
import { MessageItem, ThinkingMessage } from './message';

interface MessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function Messages({ messages, isLoading }: MessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Using scrollIntoView for the most reliable scrolling
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when messages change or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div 
      ref={containerRef} 
      className="flex-1 overflow-y-auto w-full h-full p-4 space-y-4"
    >
      {messages.length === 0 && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <h3 className="text-lg font-semibold mb-2">Welcome to AI Chat</h3>
            <p>Send a message to start a conversation</p>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}

        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <ThinkingMessage />
        )}
      </div>

      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
} 