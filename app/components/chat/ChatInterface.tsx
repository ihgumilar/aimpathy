'use client';

import { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_PROMPTS = [
  {
    title: "Write a to-do list for a personal project or task",
    icon: "👤"
  },
  {
    title: "Generate an email to reply to a job offer",
    icon: "✉️"
  },
  {
    title: "Summarise this article or text for me in one paragraph",
    icon: "📄"
  },
  {
    title: "How does AI work in a technical capacity",
    icon: "🤖"
  }
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setIsUploading(true);
      setSelectedFile(file);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload and index PDF');
        }
        
        const data = await response.json();
        setSessionId(data.session_id);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload and index PDF');
        clearAttachment();
      } finally {
        setIsUploading(false);
      }
    } else {
      alert('Please select a PDF file');
      clearAttachment();
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: ChatMessage = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsStreaming(true);

    try {
      const formData = new FormData();
      formData.append('message', input);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }
      if (sessionId) {
        formData.append('sessionId', sessionId);
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let responseContent = '';

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.error) {
                    setMessages((prev) => [
                      ...prev.slice(0, -1),
                      { role: 'assistant', content: parsed.error },
                    ]);
                    break;
                  } else if (parsed.content) {
                    responseContent += parsed.content;
                    setMessages((prev) => [
                      ...prev.slice(0, -1),
                      { role: 'assistant', content: responseContent },
                    ]);
                  }
                } catch (e) {
                  console.error('Failed to parse chunk:', e);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }

      const newSessionId = response.headers.get('x-session-id');
      if (newSessionId) {
        setSessionId(newSessionId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error: Failed to get response' },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const clearAttachment = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (sessionId) {
        fetch(`/api/chat/session/${sessionId}`, {
          method: 'DELETE',
        }).catch(console.error);
      }
    };
  }, [sessionId]);

  return (
    <div className="chat-container">
      {messages.length === 0 ? (
        <div className="welcome-screen">
          <h1><span className="highlight">AI</span><span className="normal">mpathy</span></h1>
          <h2>What would you like to know?</h2>
          <p className="subtitle">Use one of the most common prompts below or use your own to begin</p>
          
          <div className="prompts-grid">
            {SUGGESTED_PROMPTS.map((prompt, index) => (
              <button
                key={index}
                className="prompt-card"
                onClick={() => handlePromptClick(prompt.title)}
              >
                <span className="prompt-icon">{prompt.icon}</span>
                <span className="prompt-text">{prompt.title}</span>
              </button>
            ))}
          </div>
          
          <button className="refresh-button">
            🔄 Refresh Prompts
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'p-4 rounded-lg max-w-[80%]',
                message.role === 'user'
                  ? 'bg-blue-500 text-white ml-auto'
                  : 'bg-gray-200 text-gray-900'
              )}
            >
              {message.content}
            </div>
          ))}
        </div>
      )}

      <div className="input-form">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          ref={fileInputRef}
          className="hidden"
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {selectedFile && (
          <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded">
            <span className="text-sm">{selectedFile.name}</span>
            <button
              onClick={clearAttachment}
              className="hover:bg-gray-200 rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          className="chat-input"
        />
        
        <button
          onClick={handleSendMessage}
          disabled={!input.trim()}
          className="send-button disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {showToast && (
        <div className="fixed bottom-20 right-4 bg-green-500 text-white px-4 py-2 rounded-md">
          PDF uploaded successfully
        </div>
      )}

      {isStreaming && (
        <div className="fixed bottom-24 right-4 text-sm text-gray-500">
          AI is typing...
        </div>
      )}
    </div>
  );
} 