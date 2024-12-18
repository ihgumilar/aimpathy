'use client'

import { Search } from 'lucide-react'

export default function ChatList() {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <div className="relative">
          <input
            type="search"
            placeholder="Search chats..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {/* Chat list items will go here */}
        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
          <h3 className="font-medium">Example Chat</h3>
          <p className="text-sm text-gray-600 truncate">Last message preview...</p>
        </div>
      </div>
    </div>
  )
} 