'use client';

import { Attachment, ChatRequestOptions } from 'ai';
import { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, StopCircle } from 'lucide-react';

interface MultimodalInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  stop: () => void;
}

export function MultimodalInput({
  input,
  setInput,
  isLoading,
  handleSubmit,
  stop,
}: MultimodalInputProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Adjust textarea height when input changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px'; // Reset height to recalculate
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`; // Cap at 120px
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        submitForm(e);
      }
    }
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      handleSubmit(e as React.FormEvent<HTMLFormElement>, {
        experimental_attachments: attachments,
      });
      setInput(''); // Clear input after submission
      setAttachments([]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // For simplicity, we're just adding file names to attachments
    // In a real app, you'd upload these files to a server and get URLs
    const newAttachments: Attachment[] = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      contentType: file.type,
    }));

    setAttachments([...attachments, ...newAttachments]);
    
    // Clear the file input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* File attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((attachment, index) => (
            <div key={index} className="bg-gray-100 rounded-md px-2 py-1 text-sm flex items-center">
              <span className="truncate max-w-[200px]">{attachment.name}</span>
              <button
                onClick={() => {
                  const newAttachments = [...attachments];
                  newAttachments.splice(index, 1);
                  setAttachments(newAttachments);
                }}
                className="ml-2 text-gray-500 hover:text-gray-700"
                type="button"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={submitForm} className="flex items-end gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full hover:bg-gray-100"
          disabled={isLoading}
        >
          <Paperclip className="h-5 w-5 text-gray-500" />
        </button>
        
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[40px] max-h-[120px] py-2 px-3 pr-10 resize-none"
            disabled={isLoading}
          />
          
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2 p-1.5 rounded-full bg-blue-500 text-white disabled:opacity-50 hover:bg-blue-600 transition-colors"
          >
            {isLoading ? (
              <StopCircle className="h-5 w-5" onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                stop();
              }} />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 