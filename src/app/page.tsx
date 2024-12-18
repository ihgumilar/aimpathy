'use client'

import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import { Send, Image, Video, Music, BarChart2 } from 'lucide-react'
import { useState } from 'react'

export default function Home() {
  const [mediaType, setMediaType] = useState('all')

  return (
    <div className="flex h-screen">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <TopBar />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col items-center justify-center h-full">
            <img
              src="https://picsum.photos/200"
              alt="AI Assistant"
              className="w-32 h-32 rounded-full mb-6"
            />
            <h2 className="text-2xl font-bold mb-2">Welcome to AI Chat</h2>
            <p className="text-gray-400 mb-8">Start a new conversation or select an existing chat</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-[#2D2D2D] p-6 rounded-lg hover:bg-[#363636] transition-colors"
                >
                  <h3 className="text-xl font-semibold mb-2">Feature Card {i}</h3>
                  <p className="text-gray-400">
                    Description of feature {i} and its capabilities in the AI chat system.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </main>
        
        <div className="border-t border-[#2D2D2D] p-4">
          <div className="flex gap-4 mb-4 justify-center">
            {[
              { icon: Image, label: 'Image' },
              { icon: Video, label: 'Video' },
              { icon: Music, label: 'Music' },
              { icon: BarChart2, label: 'Analytics' },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                className={`p-2 rounded-lg flex items-center gap-2 ${
                  mediaType === label.toLowerCase()
                    ? 'bg-[#2ECC71] text-white'
                    : 'hover:bg-[#2D2D2D]'
                }`}
                onClick={() => setMediaType(label.toLowerCase())}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
          </div>
          
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 bg-[#2D2D2D] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2ECC71]"
            />
            <button className="bg-[#2ECC71] text-white rounded-lg px-4 py-2 flex items-center gap-2">
              <Send size={20} />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
