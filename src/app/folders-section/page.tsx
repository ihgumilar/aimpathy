'use client'

import MainLayout from '@/components/layout/MainLayout'
import { Folder, Plus, MoreVertical, File } from 'lucide-react'
import { useState } from 'react'

export default function FoldersSection() {
  const [folders] = useState([
    {
      id: 1,
      name: 'Work Projects',
      items: 12,
      color: '#2ECC71',
    },
    {
      id: 2,
      name: 'Personal Notes',
      items: 8,
      color: '#E74C3C',
    },
    {
      id: 3,
      name: 'Research',
      items: 15,
      color: '#3498DB',
    },
  ])

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Folders</h1>
          <button className="bg-[#2ECC71] text-white rounded-lg px-4 py-2 flex items-center gap-2">
            <Plus size={20} />
            New Folder
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="bg-[#2D2D2D] rounded-lg p-4 hover:bg-[#363636] transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Folder style={{ color: folder.color }} />
                  <h3 className="font-semibold">{folder.name}</h3>
                </div>
                <button className="p-1 hover:bg-[#1E1E1E] rounded-lg">
                  <MoreVertical size={20} />
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-gray-400">
                <File size={16} />
                <span>{folder.items} items</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  )
} 