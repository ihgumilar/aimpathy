'use client'

import MainLayout from '@/components/layout/MainLayout'
import { MessageSquare, MoreVertical } from 'lucide-react'

export default function MyChats() {
  const chats = [
    {
      id: 1,
      name: 'Project Discussion',
      lastMessage: 'Let\'s review the designs tomorrow',
      timestamp: '2h ago',
    },
    {
      id: 2,
      name: 'Travel Planning',
      lastMessage: 'How about visiting Paris?',
      timestamp: '5h ago',
    },
    // Add more chats as needed
  ]

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">My Chats</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="bg-[#2D2D2D] rounded-lg p-4 hover:bg-[#363636] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <MessageSquare className="text-[#2ECC71]" />
                  <h3 className="font-semibold">{chat.name}</h3>
                </div>
                <button className="p-1 hover:bg-[#1E1E1E] rounded-lg">
                  <MoreVertical size={20} />
                </button>
              </div>
              
              <p className="text-gray-400 text-sm mb-2">{chat.lastMessage}</p>
              <span className="text-xs text-gray-500">{chat.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
} 