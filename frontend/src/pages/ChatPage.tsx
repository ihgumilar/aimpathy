import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface ChatPageProps {
  sessionId: string;
  onReset: () => void;
  fileName?: string;
}

export default function ChatPage({ sessionId, onReset, fileName }: ChatPageProps) {
  const [messages, setMessages] = useState<Array<{type: string, content: string}>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      setIsLoading(true);
      console.log("\n=== Sending Query ===");
      console.log("Message:", input);

      // Add user message to chat
      setMessages(prev => [...prev, { type: 'user', content: input }]);

      // Send query to backend team agent
      const response = await axios.post(
        `${API_BASE_URL}/agents/query`,
        { message: input },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Response from backend:", response.data);

      if (response.data && response.data.response) {
        setMessages(prev => [...prev, { 
          type: 'agent', 
          content: response.data.response 
        }]);
      }
      
      setInput('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        type: 'error', 
        content: `Error: ${error.response?.data?.detail || error.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Chat with AI Team</h2>
        <button
          onClick={onReset}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
        >
          Back
        </button>
      </div>

      {fileName && (
        <div className="mb-4 p-2 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Current file: {fileName}</p>
        </div>
      )}

      <div className="h-[500px] overflow-y-auto border rounded p-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded ${
              message.type === 'user' ? 'bg-blue-100 ml-auto' : 
              message.type === 'agent' ? 'bg-gray-100' :
              message.type === 'error' ? 'bg-red-100' : 'bg-green-100'
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          className="flex-1 p-2 border rounded"
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
} 