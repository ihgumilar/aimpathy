'use client'

import MainLayout from '@/components/layout/MainLayout'
import { Send, Paperclip, Trash2 } from 'lucide-react'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function Chat() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [inputMessage, setInputMessage] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleClearAll = async () => {
    try {
      setMessages([])
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      await fetch('/api/reset-index', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Error clearing chat:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedFile) return

    // Add user message to chat
    const userMessage = { role: 'user', content: inputMessage }
    setMessages(prev => [...prev, userMessage])

    // Add AI response
    const aiResponse = { role: 'assistant', content: 'This is a sample response.' }
    setMessages(prev => [...prev, aiResponse])
    
    setInputMessage('')
  }

  return (
    <MainLayout>
      <div className="relative min-h-screen bg-[#1E1E1E]">
        {/* Floating Clear Button */}
        {messages.length > 0 && (
          <div className="absolute top-5 right-5" style={{ zIndex: 1000 }}>
            <button
              onClick={handleClearAll}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 shadow-lg"
            >
              <Trash2 className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* Chat Content */}
        <div className="flex flex-col h-full">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-[#2ECC71] ml-auto text-white' 
                    : 'bg-[#2D2D2D] text-white'
                } max-w-[80%]`}
              >
                {message.content}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="border-t border-[#2D2D2D] p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage()
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 bg-[#2D2D2D] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2ECC71] placeholder-gray-400"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 hover:bg-[#2D2D2D] rounded-full transition-colors"
                title="Send message"
              >
                <Send className="h-5 w-5 text-[#2ECC71]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 