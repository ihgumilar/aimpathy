'use client';

import { useState, useRef, useEffect } from 'react';
import { Paperclip, Send, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LinearProgress, Box, Typography } from '@mui/material';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_PROMPTS = [
  {
    title: "dentify the key takeaways from this document",
    icon: "🗝️"
  },
  {
    title: "List the main arguments or points discussed in this file",
    icon: "✅"
  },
  {
    title: "Summarise this article or text for me in one paragraph",
    icon: "📝"
  },
  {
    title: "Outline the key ideas from this file",
    icon: "🧩"
  }
];

interface ProcessingStatus {
  isProcessing: boolean;
  progress: number;
  currentStep: string;
}

type ProgressUpdate = {
  progress: number;
  step: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    isProcessing: false,
    progress: 0,
    currentStep: ''
  });
  const wsRef = useRef<WebSocket | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setIsUploading(true);
      setSelectedFile(file);
      
      // Initialize WebSocket
      let ws: WebSocket | null = null;
      
      try {
        // Create new WebSocket connection
        ws = new WebSocket('ws://localhost:8000/ws');
        
        // Wait for WebSocket to connect before proceeding
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('WebSocket connection timeout'));
          }, 5000);

          ws!.onopen = () => {
            console.log('WebSocket connected, starting upload...');
            clearTimeout(timeout);
            resolve(true);
          };

          ws!.onerror = (error) => {
            console.error('WebSocket connection failed:', error);
            clearTimeout(timeout);
            reject(error);
          };
        });

        // Set initial progress
        setProcessingStatus({
          isProcessing: true,
          progress: 0,
          currentStep: 'Starting upload...'
        });

        // Set up message handler
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('Progress update:', data);
          setProcessingStatus(prev => ({
            ...prev,
            isProcessing: true,
            progress: data.progress,
            currentStep: data.step
          }));
        };

        // Now proceed with file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('socket_id', String(ws.url.split('/').pop()));

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload and index PDF');
        }
        
        const data = await response.json();
        setSessionId(data.session_id);

        // Show completion
        setProcessingStatus(prev => ({
          ...prev,
          isProcessing: false,
          progress: 100,
          currentStep: 'Processing complete!'
        }));

        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          setProcessingStatus({
            isProcessing: false,
            progress: 0,
            currentStep: ''
          });
        }, 2000);

      } catch (error) {
        console.error('Error uploading file:', error);
        setProcessingStatus({
          isProcessing: false,
          progress: 0,
          currentStep: 'Upload failed'
        });
        alert('Failed to upload and index PDF');
        clearAttachment();
      } finally {
        setIsUploading(false);
        if (ws && ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
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
      // Check if there's no file uploaded and no active session
      if (!selectedFile && !sessionId) {
        setMessages((prev) => [
          ...prev,
          { 
            role: 'assistant', 
            content: 'No file uploaded ! Please upload one and try again :)' 
          },
        ]);
        setIsStreaming(false);
        return;
      }

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

  const ProcessingProgressBar = () => {
    if (!processingStatus.isProcessing && processingStatus.progress === 0) return null;

    // Function to determine text color based on status
    const getStatusColor = () => {
      if (processingStatus.progress === 100) return "text-green-600";
      if (processingStatus.currentStep.includes("failed")) return "text-red-600";
      return "text-blue-600"; // Default color for in-progress
    };

    return (
      <div className="w-full mb-4 px-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {processingStatus.currentStep} ({processingStatus.progress}%)
          </span>
          {processingStatus.progress === 100 && (
            <span className="text-sm text-green-600 ml-2">
              ✓
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-2.5 progress-bar-striped ${
              processingStatus.progress === 100 
                ? 'bg-green-600' 
                : processingStatus.currentStep.includes("failed")
                  ? 'bg-red-600'
                  : 'bg-blue-600'
            }`}
            style={{ 
              width: `${processingStatus.progress}%`,
            }}
          />
        </div>
      </div>
    );
  };

  const handleClearChat = async () => {
    try {
      // Clear frontend state
      setMessages([]);
      setInput('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Clear backend session if exists
      if (sessionId) {
        await fetch(`/api/chat/session/${sessionId}`, {
          method: 'DELETE',
        });
        setSessionId(null);
      }

      // Reset the index
      await fetch('/api/reset-index', {
        method: 'POST',
      });

      console.log('Chat and session cleared successfully');
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  return (
    <div className="chat-container">
      <ProcessingProgressBar />
      
      {messages.length === 0 ? (
        <div className="welcome-screen">
          <h1>
            <a href="https://www.aimpathy.co.nz" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
              <span className="highlight">AI</span><span className="normal">mpathy</span>
            </a>
          </h1>
          <h2>What would you like to know?</h2>
          <p className="subtitle">Use one of these prompts below to begin</p>
          
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
        </div>
      ) : (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={handleClearChat}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear Chat
            </button>
          </div>

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
        </>
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