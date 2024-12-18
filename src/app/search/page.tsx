'use client'

import MainLayout from '@/components/layout/MainLayout'
import { Search, Filter, Clock } from 'lucide-react'
import { useState } from 'react'

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [recentSearches] = useState([
    'Project updates',
    'Meeting notes',
    'Travel plans',
  ])

  return (
    <MainLayout>
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search in chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#2D2D2D] rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2ECC71]"
            />
            <button className="absolute right-3 top-2 p-1 hover:bg-[#1E1E1E] rounded-lg">
              <Filter size={20} />
            </button>
          </div>

          {!searchQuery && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Searches</h2>
              <div className="space-y-2">
                {recentSearches.map((search) => (
                  <div
                    key={search}
                    className="flex items-center gap-3 p-2 hover:bg-[#2D2D2D] rounded-lg cursor-pointer"
                  >
                    <Clock size={16} className="text-gray-400" />
                    <span>{search}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
} 