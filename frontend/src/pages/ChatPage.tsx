import React, { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatPageProps {
  sessionId: string | null;
  onReset: () => void;
  fileName?: string;
}

const formatMessage = (content: string): string => {
  // Check if the content has line breaks and numbers/bullets
  if (content.includes('\n')) {
    const lines = content.split('\n').filter(line => line.trim());
    
    // Check if lines start with numbers or asterisks
    const hasNumbers = lines.some(line => /^\d+\./.test(line.trim()));
    const hasBullets = lines.some(line => /^\*/.test(line.trim()));
    
    if (hasNumbers || hasBullets) {
      // Return the content as is, it already has formatting
      return content;
    }
    
    // Add numbers to each line if it looks like a list
    if (lines.length > 1) {
      return lines.map((line, index) => `${index + 1}. ${line.trim()}`).join('\n');
    }
  }
  return content;
};

const ChatPage: React.FC<ChatPageProps> = ({ sessionId, onReset, fileName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add predefined prompts
  const prompts = [
    {
      type: 'clinical',
      icon: '📝',
      text: 'Summarize the key clinical findings and diagnoses',
    },
    {
      type: 'treatment',
      icon: '✓',
      text: 'List the recommended treatment approaches',
    },
    {
      type: 'symptoms',
      icon: '🔍',
      text: 'Extract the main symptoms and behavioral patterns',
    },
    {
      type: 'risk',
      icon: '🧩',
      text: 'Identify risk factors and protective factors',
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionId || !inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('query', userMessage);

      const response = await fetch('http://localhost:8000/api/query', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Query failed');
      }

      let fullResponse = '';
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(5);
              if (data === '[DONE]') break;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullResponse += parsed.content;
                  setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].content = fullResponse;
                    return newMessages;
                  });
                } else if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (e) {
                console.error('Error parsing chunk:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/reset-index', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to reset chat');
      }

      setMessages([]);
      onReset();
    } catch (error) {
      console.error('Error resetting chat:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <a 
            href="https://www.aimpathy.co.nz/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xl font-semibold hover:text-red-500 transition-colors"
          >
            AImpathy
          </a>
          {fileName && (
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              {fileName}
            </span>
          )}
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Reset Chat
        </button>
      </div>

      {/* Prompts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white border-b">
        {prompts.map((prompt) => (
          <div
            key={prompt.type}
            onClick={() => setInputMessage(prompt.text)}
            className="bg-white p-4 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center">
              <span className="mr-2">{prompt.icon}</span>
              <span className="text-sm">{prompt.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white shadow-sm'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="whitespace-pre-line">
                  {formatMessage(message.content) || (isLoading && index === messages.length - 1 ? '...' : '')}
                </div>
              ) : (
                <div>
                  {message.content || (isLoading && index === messages.length - 1 ? '...' : '')}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            disabled={isLoading || !inputMessage.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPage; 