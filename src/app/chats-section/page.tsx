'use client'

import MainLayout from '@/components/layout/MainLayout'
import { MessageSquare, Users, Star, Clock } from 'lucide-react'
import { useState } from 'react'

export default function ChatsSection() {
  const [activeTab, setActiveTab] = useState('recent')
  const [chats] = useState({
    recent: [
      { id: 1, name: 'Latest Project Update', participants: 3, time: '2h ago' },
      { id: 2, name: 'Team Sync', participants: 5, time: '4h ago' },
    ],
    starred: [
      { id: 3, name: 'Important Meeting Notes', participants: 2, time: '1d ago' },
    ],
    groups: [
      { id: 4, name: 'Design Team', participants: 8, time: '3h ago' },
      { id: 5, name: 'Development Team', participants: 12, time: '5h ago' },
    ],
  })

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Chats</h1>
        
        <div className="flex gap-4 mb-6 border-b border-[#2D2D2D]">
          {[
            { id: 'recent', icon: Clock, label: 'Recent' },
            { id: 'starred', icon: Star, label: 'Starred' },
            { id: 'groups', icon: Users, label: 'Groups' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`pb-2 px-4 flex items-center gap-2 ${
                activeTab === id
                  ? 'border-b-2 border-[#2ECC71] text-[#2ECC71]'
                  : 'text-gray-400'
              }`}
              onClick={() => setActiveTab(id)}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {chats[activeTab as keyof typeof chats].map((chat) => (
            <div
              key={chat.id}
              className="bg-[#2D2D2D] rounded-lg p-4 hover:bg-[#363636] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="text-[#2ECC71]" />
                  <div>
                    <h3 className="font-semibold">{chat.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Users size={14} />
                      <span>{chat.participants} participants</span>
                      <span>•</span>
                      <span>{chat.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
} 