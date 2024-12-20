'use client'

import { MessageSquare, FolderOpen, Search, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Chat',
      href: '/chat',
      icon: MessageSquare,
    },
    {
      name: 'Folders',
      href: '/folders-section',
      icon: FolderOpen,
    },
    {
      name: 'Search',
      href: '/search',
      icon: Search,
    },
  ]

  return (
    <div className="w-64 h-full bg-[#1E1E1E] text-white p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">AI Chat</h1>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-lg hover:bg-[#2D2D2D] transition-colors ${
                pathname === item.href ? 'bg-[#2D2D2D]' : ''
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-4 space-y-2 w-52">
        <Link
          href="/settings"
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#2D2D2D] transition-colors"
        >
          <Settings size={20} />
          <span>Settings</span>
        </Link>
        <button className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#2D2D2D] transition-colors w-full">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
} 