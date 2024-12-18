'use client'

import { Share2 } from 'lucide-react'

export default function TopBar() {
  return (
    <div className="h-16 border-b border-[#2D2D2D] flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold">Current Chat</h1>
        <span className="text-sm text-gray-400">v3.14.3</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-[#2D2D2D] rounded-lg">
          <Share2 size={20} />
        </button>
      </div>
    </div>
  )
} 