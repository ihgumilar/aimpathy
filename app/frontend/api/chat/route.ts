import { NextRequest } from 'next/server'
import { Message as VercelChatMessage, StreamingTextResponse } from 'ai'

export const runtime = 'edge'

function mockStreamingResponse(message: string): ReadableStream {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const words = message.split(' ')
      for (const word of words) {
        await new Promise(resolve => setTimeout(resolve, 100)) // Simulate delay
        controller.enqueue(encoder.encode(word + ' '))
      }
      controller.close()
    },
  })
  return stream
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json()
  const lastMessage = messages[messages.length - 1]

  let response: string

  if (lastMessage.content.toLowerCase().includes('summary')) {
    response = "Based on my analysis of the document, here are the key points: 1) The text discusses various aspects of mental health and well-being, 2) It emphasizes the importance of early intervention and professional support, 3) Several coping strategies and treatment options are outlined, 4) The document highlights the role of social support in recovery. Would you like me to elaborate on any of these points?"
  } else if (lastMessage.content.toLowerCase().includes('hello') || lastMessage.content.toLowerCase().includes('hi')) {
    response = "Hello! I'm your AI assistant for analyzing mental health documents. I can help you understand the content, provide summaries, and answer specific questions about the document. What would you like to know?"
  } else {
    response = "I've analyzed the document and can help you understand its content. I can provide insights about specific topics, create summaries, or answer questions about particular aspects of mental health discussed in the text. What specific information would you like to explore?"
  }

  const stream = mockStreamingResponse(response)
  return new StreamingTextResponse(stream)
}

