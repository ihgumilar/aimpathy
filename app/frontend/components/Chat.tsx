'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, FileText, Send } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}

export default function Chat() {
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSummaryLoading, setIsSummaryLoading] = useState(false)
  const [isThinking, setIsThinking] = useState(false);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  const mockStreamingResponse = async (responseText: string) => {
    const words = responseText.split(' ')
    let currentContent = ''
    
    // Create initial assistant message
    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      id: Date.now().toString()
    }
    
    setMessages(prev => [...prev, assistantMessage])

    // Stream each word with a delay
    for (const word of words) {
      await new Promise(resolve => setTimeout(resolve, 50))
      currentContent += (currentContent ? ' ' : '') + word
      
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = {
          ...assistantMessage,
          content: currentContent
        }
        return newMessages
      })
      
      scrollToBottom()
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input,
      id: Date.now().toString()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    scrollToBottom()

    // Set thinking state
    setIsThinking(true)

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Reset thinking state
    setIsThinking(false)

    // Mock response based on user input
    let responseText = ''
    if (input.toLowerCase().includes('hello') || input.toLowerCase().includes('hi')) {
      responseText = "Hello! I'm your AI assistant for analyzing mental health documents. I can help you understand the content, provide summaries, and answer specific questions about the document. What would you like to know?"
    } else if (input.toLowerCase().includes('summary')) {
      responseText = "Based on my analysis of the psychological report, here are the key points: 1) The document discusses various aspects of mental health assessment, 2) It contains detailed observations and recommendations, 3) Several treatment approaches are outlined, 4) The report emphasizes evidence-based interventions. Would you like me to elaborate on any of these points?"
    } else {
      responseText = "I've analyzed the document and can help answer your question. The psychological report contains information about assessment methods, findings, and recommendations. Could you please specify which aspect you'd like to explore further?"
    }

    await mockStreamingResponse(responseText)
  }

  const handleGetSummary = async () => {
    if (isSummaryLoading) return
    setIsSummaryLoading(true)

    const summaryMessage: Message = {
      role: 'user',
      content: 'Please provide a summary of the document.',
      id: Date.now().toString()
    }
    setMessages(prev => [...prev, summaryMessage])
    scrollToBottom()

    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1000))

    const summaryResponse = "Here's a comprehensive summary of the psychological report: The document presents a detailed analysis of mental health assessments and interventions. It covers various aspects including diagnostic criteria, treatment recommendations, and progress monitoring methods. Key findings indicate the importance of personalized treatment approaches and regular assessment of outcomes. The report also emphasizes the role of evidence-based practices in mental health care delivery. Would you like me to elaborate on any specific aspect of this summary?"
    
    await mockStreamingResponse(summaryResponse)
    setIsSummaryLoading(false)
  }

  const clearChat = () => {
    setMessages([])
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-white">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`inline-block p-3 rounded-lg max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="inline-block p-3 rounded-lg bg-gray-100 text-gray-900">
              Thinking ...
            </div>
          </div>
        )}
        {isThinking && (
          <div className="flex justify-start">
            <div className="inline-block p-3 rounded-lg bg-gray-100 text-gray-900">
              <span className="inline-block">
                Thinking
                <span className="inline-block animate-pulse">. . .</span>
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="border-t p-4 space-y-4">
        <div className="flex space-x-2">
          <Button
            onClick={handleGetSummary}
            variant="outline"
            className={`mr-auto transition-all duration-200 ${
              isSummaryLoading ? 'bg-gray-100' : 'hover:bg-gray-100 active:bg-gray-200'
            }`}
            disabled={isSummaryLoading}
          >
            {isSummaryLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Summarizing...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" /> Get Summary
              </>
            )}
          </Button>
          <Button
            onClick={clearChat}
            variant="outline"
            className="text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSend} className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your document..."
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}

