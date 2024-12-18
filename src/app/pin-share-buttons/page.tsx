'use client'

import MainLayout from '@/components/layout/MainLayout'
import { Pin, Share2, Copy, Download, Link2, Mail } from 'lucide-react'
import { useState } from 'react'

export default function PinShareButtons() {
  const [isPinned, setIsPinned] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  const shareOptions = [
    { icon: Copy, label: 'Copy Link', action: () => console.log('Copy link') },
    { icon: Download, label: 'Export Chat', action: () => console.log('Export') },
    { icon: Link2, label: 'Share URL', action: () => console.log('Share URL') },
    { icon: Mail, label: 'Email', action: () => console.log('Email') },
  ]

  return (
    <MainLayout>
      <div className="max-w-md mx-auto p-6">
        <div className="bg-[#2D2D2D] rounded-lg p-6 space-y-6">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`p-3 rounded-lg flex items-center gap-2 ${
                isPinned ? 'bg-[#2ECC71] text-white' : 'hover:bg-[#363636]'
              }`}
            >
              <Pin size={20} />
              <span>{isPinned ? 'Pinned' : 'Pin Chat'}</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-3 rounded-lg flex items-center gap-2 hover:bg-[#363636]"
              >
                <Share2 size={20} />
                <span>Share</span>
              </button>

              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#2D2D2D] rounded-lg shadow-lg overflow-hidden">
                  {shareOptions.map(({ icon: Icon, label, action }) => (
                    <button
                      key={label}
                      onClick={action}
                      className="w-full p-3 flex items-center gap-3 hover:bg-[#363636] text-left"
                    >
                      <Icon size={18} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
} 