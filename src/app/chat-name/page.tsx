'use client'

import MainLayout from '@/components/layout/MainLayout'
import { Users, Settings, Image, Link, Download, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function ChatName() {
  const [chatDetails] = useState({
    name: 'Project Discussion',
    participants: [
      { id: 1, name: 'John Doe', avatar: 'https://picsum.photos/32/32?1' },
      { id: 2, name: 'Jane Smith', avatar: 'https://picsum.photos/32/32?2' },
      { id: 3, name: 'Mike Johnson', avatar: 'https://picsum.photos/32/32?3' },
    ],
    mediaCount: 15,
    linksCount: 8,
  })

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-[#2D2D2D] rounded-lg p-6 mb-6">
          <input
            type="text"
            value={chatDetails.name}
            className="text-2xl font-bold bg-transparent focus:outline-none focus:ring-2 focus:ring-[#2ECC71] rounded px-2 py-1 w-full mb-4"
          />
          
          <div className="flex items-center gap-4 text-gray-400">
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>{chatDetails.participants.length} participants</span>
            </div>
            <button className="hover:text-white">
              <Settings size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#2D2D2D] rounded-lg p-4">
            <h3 className="font-semibold mb-4">Participants</h3>
            <div className="space-y-3">
              {chatDetails.participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{participant.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#2D2D2D] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Image size={20} />
                  <span>Media</span>
                </div>
                <span className="text-gray-400">{chatDetails.mediaCount}</span>
              </div>
            </div>

            <div className="bg-[#2D2D2D] rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Link size={20} />
                  <span>Links</span>
                </div>
                <span className="text-gray-400">{chatDetails.linksCount}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button className="w-full p-3 flex items-center gap-2 text-blue-400 hover:bg-[#2D2D2D] rounded-lg">
              <Download size={20} />
              <span>Export Chat</span>
            </button>
            <button className="w-full p-3 flex items-center gap-2 text-red-400 hover:bg-[#2D2D2D] rounded-lg">
              <Trash2 size={20} />
              <span>Delete Chat</span>
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 