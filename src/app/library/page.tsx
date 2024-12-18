import MainLayout from '@/components/layout/MainLayout'
import { Search, Filter } from 'lucide-react'

export default function LibraryPage() {
  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Library</h1>
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="search"
                placeholder="Search templates..."
                className="pl-10 pr-4 py-2 border rounded-lg"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg">
              <Filter size={20} />
              <span>Filter</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Template cards will go here */}
        </div>
      </div>
    </MainLayout>
  )
} 