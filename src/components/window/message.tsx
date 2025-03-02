'use client';

import { Message } from 'ai';
import { Bot, UserCircle } from 'lucide-react';

interface MessageProps {
  message: Message;
}

export function MessageItem({ message }: MessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex w-full ${
        isUser ? 'justify-end' : 'justify-start'
      } mb-4`}
    >
      <div
        className={`flex items-start gap-3 ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <div
          className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-100' : 'bg-purple-100'
          }`}
        >
          {isUser ? (
            <UserCircle className="h-5 w-5 text-blue-600" />
          ) : (
            <Bot className="h-5 w-5 text-purple-600" />
          )}
        </div>

        <div
          className={`px-4 py-2 rounded-lg max-w-[80%] ${
            isUser
              ? 'bg-blue-500 text-white rounded-tr-none'
              : 'bg-gray-100 text-gray-800 rounded-tl-none'
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}

export function ThinkingMessage() {
  return (
    <div className="flex w-full justify-start mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
          <Bot className="h-5 w-5 text-purple-600" />
        </div>

        <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 rounded-tl-none">
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
} 