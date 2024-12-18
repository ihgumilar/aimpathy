'use client'

import { Search, Plus, Folder, MessageSquare } from 'lucide-react'
import { useState } from 'react'

export default function Sidebar() {
  const [folders] = useState([
    { name: 'Work chats', items: ['Project A', 'Project B'] },
    { name: 'Life chats', items: ['Travel', 'Shopping'] },
    { name: 'Projects chats', items: ['Website', 'Mobile App'] },
    { name: 'Clients chats', items: ['Client X', 'Client Y'] },
  ])

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
        {folders.map((folder) => (
          <div key={folder.name} className="mb-4">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Folder size={16} />
              <span>{folder.name}</span>
            </div>
            {folder.items.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 pl-6 py-2 hover:bg-[#1E1E1E] rounded-lg cursor-pointer"
              >
                <MessageSquare size={16} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
} 