'use client'

import { Search, Plus } from 'lucide-react'

export default function Sidebar() {
  return (
    <div className="w-[280px] h-screen bg-[#2D2D2D] p-4 flex flex-col">
      <button className="w-full bg-[#2ECC71] text-white rounded-lg p-2 mb-4 flex items-center justify-center gap-2">
        <Plus size={20} />
        New Chat
      </button>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search chats..."
          className="w-full bg-[#1E1E1E] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Chat list will be populated here */}
      </div>
    </div>
  )
} 