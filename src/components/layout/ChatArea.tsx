'use client'

import { Send } from 'lucide-react'
import Image from 'next/image'

export default function ChatArea() {
  return (
    <div className="h-full flex flex-col">
      <header className="h-16 border-b border-gray-200 flex items-center px-6 bg-white">
        <h1 className="text-xl font-semibold">New Chat</h1>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="flex gap-4">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <Image
              src="https://picsum.photos/32/32"
              alt="AI Avatar"
              width={32}
              height={32}
            />
          </div>
          <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
            <p className="text-gray-700">Hello! How can I help you today?</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-4">
          <textarea
            className="flex-1 resize-none rounded-lg border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Type your message..."
            rows={1}
          />
          <button className="p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
} 