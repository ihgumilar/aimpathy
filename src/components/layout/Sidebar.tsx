'use client'

import { MessageSquare, Library, AppWindow, Plus } from 'lucide-react'
import Link from 'next/link'

export default function Sidebar() {
  return (
    <div className="w-[250px] bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <button className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white rounded-lg py-2 px-4 hover:bg-purple-700">
          <Plus size={20} />
          <span>New Chat</span>
        </button>
      </div>
      
      <nav className="flex-1">
        <div className="px-3 py-2">
          <Link href="/chat" className="flex items-center gap-2 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
            <MessageSquare size={20} />
            <span>Chats</span>
          </Link>
          <Link href="/library" className="flex items-center gap-2 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
            <Library size={20} />
            <span>Library</span>
          </Link>
          <Link href="/apps" className="flex items-center gap-2 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100">
            <AppWindow size={20} />
            <span>Apps</span>
          </Link>
        </div>
      </nav>
    </div>
  )
} 